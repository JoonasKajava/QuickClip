import { Box, Button, Icon, makeStyles, Menu, MenuItem } from "@material-ui/core";
import { remote } from "electron";
import React, { useState } from "react";
import store from "../../../store/store";


const useStyles = makeStyles({
    titleBar: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 10
    },
    titleText: {
        "-webkit-app-region": "drag",
        flexGrow: 2,
        userSelect: "none"
    },
    menu: {
        "-webkit-app-region": "no-drag"
    },
    titleButtons: {
        display: "flex"
    },
    button: {
        padding: "5px 15px",
        cursor: "pointer",
        userSelect: "none",
        '&:hover': {
            backgroundColor: "var(--secondary-bg-color)"
        }
    }
});

export const TitleBar = () => {
    const styles = useStyles();
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

    const mainWindow = remote.getCurrentWindow();

    const openMenu = (e: React.MouseEvent<HTMLElement>) => {
        setMenuOpen(true);
        setMenuAnchorEl(e.currentTarget)
    }

    const closeMenu = () => {
        setMenuOpen(false);
        setMenuAnchorEl(null);
    }

    return <div className={styles.titleBar}>
        <div className={styles.titleText}>
            {document.title}
            <Box display="inline-block" className={styles.menu} marginLeft={1}>
                <Button variant="outlined" onClick={openMenu}>Menu</Button>
            </Box>

            <Menu keepMounted anchorEl={menuAnchorEl} open={menuOpen} onClose={closeMenu}>
                <MenuItem onClick={() => { store.video.setSrc(null); closeMenu() }}>Open file</MenuItem>
                <MenuItem>Settings</MenuItem>
            </Menu>
        </div>
        <div className={styles.titleButtons}>
            <span onClick={() => mainWindow.minimize()} className={"material-icons " + styles.button}>minimize</span>
            <span onClick={() => mainWindow.maximize()} className={"material-icons " + styles.button}>fullscreen</span>
            <span onClick={() => mainWindow.close()} className={"material-icons " + styles.button}>close</span>
        </div>
    </div>
}