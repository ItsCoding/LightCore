import { Grid } from '@mui/material';
import { SliderPicker, ColorResult, HuePicker } from 'react-color';
import { TouchButton } from '../General/TouchButton';

type EffektColorProps = {
    selectedColor: string,
    onChange: (color: ColorResult | null) => void,
}

export const EffektColor = ({ selectedColor, onChange }: EffektColorProps) => {

    return (

        <Grid container columnSpacing={8}>
            <Grid item xs={10} md={11}>
                <div style={{
                    margin: '10px',
                    marginTop: '20px',
                }}>
                    <HuePicker
                        color={selectedColor}
                        onChangeComplete={onChange}
                        width="99%"
                    />
                </div>
            </Grid>
            <Grid xs={2} md={1}>
                <TouchButton variant="contained" color="error" fullWidth style={{
                    height: '100%',
                }} onInteract={() => onChange(null)}>
                    Clear
                </TouchButton>
            </Grid>
        </Grid>

    )
}