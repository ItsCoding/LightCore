import { SliderPicker, ColorResult } from 'react-color';

type EffektColorProps = {
    selectedColor: string,
    onChange: (color: ColorResult) => void,
}

export const EffektColor = ({ selectedColor, onChange }: EffektColorProps) => {

    return (
        <div style={{
            margin: '10px',
        }}>
            <SliderPicker
                color={selectedColor}
                onChangeComplete={onChange}
            />
        </div>
    )
}