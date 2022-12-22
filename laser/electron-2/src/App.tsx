import { Button } from "@mui/material"
import { renderPipeline } from "./renderPipeline"

export const App = () => {

    return (
        <div>
            <Button onClick={() => renderPipeline()}>Start</Button>
        </div>
    )
}