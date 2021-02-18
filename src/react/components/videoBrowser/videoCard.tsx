import { Card, CardActionArea, CardContent, CardMedia, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import path from 'path';
import { IVideoCardProps } from "./videoBrowserTypes";

const useStyles = makeStyles({
    root: {
        maxWidth: 250
    },
    media: {
        width: 250,
        height: 141
    }
})

export default function VideoCard(props: IVideoCardProps) {
    const classes = useStyles();

    return <Card onClick={()=> props.onClick(props.file)} className={classes.root}>
        <CardActionArea>
            <CardMedia className={classes.media} image={props.thumbnail} title={path.basename(props.file)} />
            <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">
                    {props.file}
                </Typography>
            </CardContent>
        </CardActionArea>
    </Card>
}