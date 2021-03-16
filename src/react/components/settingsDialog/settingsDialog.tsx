import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Icon, InputAdornment, List, ListItem, makeStyles, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@material-ui/core";
import { remote } from "electron";
import { glob } from "glob";
import { observer } from "mobx-react";
import { createViewModel } from "mobx-utils";
import React, { useState } from "react";
import store from "../../../store/store";
import fs from 'fs';
import { ISettingsDialogProps } from "./settingsDialogTypes";
import prettyBytes from "pretty-bytes";
import Butterflow from "../../../helpers/butterflow";



export const SettingsDialog = observer((props: ISettingsDialogProps) => {

    const [vm] = useState(createViewModel(store.settings))
    const [canHardwareAccelerate, setCanHardwareAccelerate] = useState(false);
    Butterflow.canUseHardwareAcceleration().then((can: boolean) => {
        setCanHardwareAccelerate(can);
    }).catch(() => {
        
    })

    const Save = () => {
        vm.submit();
        store.saveSettings();
        store.enqueueSnackbar("Settings saved!", {variant:"success"});
        props.onClose()
    }


    const SelectSaveLocation = () => {
        remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            title: "Select save location",
            defaultPath: remote.app.getPath("videos"),
            buttonLabel: "Select folder",
            properties: ["openDirectory"]
        }).then((returnValue) => {
            if (returnValue.canceled || !returnValue.filePaths[0]) return;
            vm.clipSaveLocation = returnValue.filePaths[0];
        })
    }

    const getCacheSize = () => {
        var size = 0;
        glob.sync(store.settings.cacheLocation + "**/*.*").forEach((match) => {
            size += fs.statSync(match).size;
        });
        return size;
    }
    const [cacheSize, setCacheSize] = useState(getCacheSize);

    const clearCache = () => {
        fs.rmdirSync(store.settings.cacheLocation, {recursive: true});
        setCacheSize(getCacheSize());
    }

    return <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
            <List>
                <ListItem>
                    <TextField onChange={(e) => vm.clipSaveLocation = e.target.value} value={vm.clipSaveLocation} label="Folder for clips"
                        InputProps={{
                            endAdornment: <InputAdornment position="end"><Button onClick={SelectSaveLocation} startIcon={<Icon>folder_open</Icon>}>Open</Button></InputAdornment>
                        }}
                    />
                </ListItem>
                <ListItem>
                    Cached items: {prettyBytes(cacheSize)} <Button onClick={clearCache} variant="outlined">Clear cache</Button>
                </ListItem>
            </List>
            <Typography variant="h6" component="h6">
                Info
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Data</TableCell>
                            <TableCell>Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Butterflow hardware acceleration</TableCell>
                            <TableCell>{canHardwareAccelerate ? "Enabled" : "Disabled"}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => { vm.reset(); props.onClose(); }} variant="outlined">
                Cancel
            </Button>
            <Button onClick={Save} variant="outlined">
                Save
            </Button>
        </DialogActions>
    </Dialog>
})