import * as React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { Effekt } from '../../types/Effekt';
import { useSnackbar } from 'notistack';

function not(a: readonly Effekt[], b: readonly Effekt[]) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: readonly Effekt[], b: readonly Effekt[]) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a: readonly Effekt[], b: readonly Effekt[]) {
    return [...a, ...not(b, a)];
}

type BlacklistTransferlistProps = {
    blacklisted: string[],
    availableEffekts: Effekt[],
    onChange: (blacklisted: Effekt[]) => void
}

export const BlacklistTransferlist = ({ blacklisted, availableEffekts, onChange }: BlacklistTransferlistProps) => {
    const [checked, setChecked] = React.useState<Effekt[]>([]);
    const [left, setLeft] = React.useState<Effekt[]>([]);
    const [right, setRightState] = React.useState<Effekt[]>([]);
    const { enqueueSnackbar } = useSnackbar();
    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    React.useEffect(() => {
        const convleft: Effekt[] = [];
        const convright: Effekt[] = [];
        console.log("Init BlacklistTransferlist", blacklisted, availableEffekts);
        availableEffekts.forEach((effekt) => {
            if (blacklisted.includes(effekt.effektSystemName)) {
                convright.push(effekt);
            } else {
                convleft.push(effekt);
            }
        })
        setLeft(convleft);
        setRight(convright, true);

    }, [blacklisted, availableEffekts])

    const setRight = (newRight: Effekt[], onPurpose = false) => {
        if (!onPurpose) onChange(newRight);
        setRightState(newRight);
    }

    const handleToggle = (value: Effekt) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const numberOfChecked = (items: readonly Effekt[]) =>
        intersection(checked, items).length;

    const handleToggleAll = (items: readonly Effekt[]) => () => {
        if (numberOfChecked(items) === items.length) {
            setChecked(not(checked, items));
        } else {
            setChecked(union(checked, items));
        }
    };

    const handleCheckedRight = () => {
        const notLeft = not(left, leftChecked);
        if (notLeft.length === 0) {
            enqueueSnackbar(`There needs to be at least one effekt left! Otherwise deactivate the randomizer.`, { variant: 'error', anchorOrigin: { vertical: "top", horizontal: "right" } });
            return;
        };
        setRight(right.concat(leftChecked));
        setLeft(notLeft);
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const customList = (title: React.ReactNode, items: readonly Effekt[]) => (
        <Card>
            <CardHeader
                sx={{ px: 2, py: 1 }}
                avatar={title !== 'Allowed' ?
                    <Checkbox
                        onClick={handleToggleAll(items)}
                        checked={numberOfChecked(items) === items.length && items.length !== 0}
                        indeterminate={
                            numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0
                        }
                        size="small"
                        disabled={items.length === 0}
                        inputProps={{
                            'aria-label': 'all items selected',
                        }}
                    /> : <div></div>
                }
                title={title}
                subheader={`${numberOfChecked(items)}/${items.length} selected`}
            />
            <Divider />
            <List
                sx={{
                    height: 230,
                    bgcolor: 'background.paper',
                    overflow: 'auto',
                }}
                dense
                component="div"
                role="list"
            >
                {items.map((value: Effekt) => {
                    const labelId = `transfer-list-all-item-${value}-label`;

                    return (
                        <ListItem
                            key={value.effektSystemName}
                            role="listitem"
                            button
                            onClick={handleToggle(value)}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(value) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{
                                        'aria-labelledby': labelId,
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={`${value.name}`} />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Card>
    );

    return (
        <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item md={5}>{customList('Allowed', left)}</Grid>
            <Grid item>
                <Grid container direction="column" alignItems="center">
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleCheckedRight}
                        disabled={leftChecked.length === 0}
                        aria-label="move selected right"
                    >
                        &gt;
                    </Button>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleCheckedLeft}
                        disabled={rightChecked.length === 0}
                        aria-label="move selected left"
                    >
                        &lt;
                    </Button>
                </Grid>
            </Grid>
            <Grid item md={5}>{customList('Blacklisted', right)}</Grid>
        </Grid>
    );
}
