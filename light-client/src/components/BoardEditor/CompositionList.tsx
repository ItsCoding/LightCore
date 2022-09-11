import { Chip, IconButton, List, ListItem, ListItemText } from "@mui/material";
import { useDrag } from "react-dnd";
import { createUUID, getFontColorByBgColor } from "../../system/Utils";
import { DropResult } from "../../types/BoardEditor/DropType";
import { Composition } from "../../types/Composition";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReorderIcon from '@mui/icons-material/Reorder';
export type CompositionListProps = {
    compositions: Array<Composition>;
}

type DraggableListItemProps = {
    composition: Composition;
}

const DraggableListItem = ({ composition }: DraggableListItemProps) => {
    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
        type: "compositionListItem",
        item: { rID: createUUID(), data: composition },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult<DropResult>()

            if (item && dropResult) {
                console.log(item, dropResult)
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }))



    return <ListItem key={composition.id}
        style={{
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.09))",
            paddingTop: "0px",
            paddingBottom: "0px",
            marginBottom: "8px",
        }}
        ref={dragPreview}
    >
        <div ref={drag} style={{
            height: "100%",
            marginLeft: "8px",
            marginRight: "16px",
        }}>
            <ReorderIcon/>
        </div>
        <ListItemText primary={composition.compositionName} secondary={<div style={{
            marginTop: "5px",
        }}>{
                composition.tags.map((tag, i) => {
                    return (<Chip
                        size="small"
                        style={{
                            marginRight: 5,
                            marginLeft: 5,
                            backgroundColor: `#${tag.color}`,
                            color: getFontColorByBgColor(tag.color)
                        }} label={tag.name} key={tag.id} />)
                })
            }</div>} />
        <IconButton onClick={() => composition.activate(() => { })}>
            <PlayArrowIcon />
        </IconButton>
    </ListItem>
}


export const CompositionList = ({ compositions }: CompositionListProps) => {
    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper', padding: { padding: 0 }, overflow: 'auto', maxHeight: "60vh" }}>
            {compositions.map((composition, i) => {
                return (
                    <DraggableListItem composition={composition} key={composition.id} />
                )
            })}
        </List>
    )
}