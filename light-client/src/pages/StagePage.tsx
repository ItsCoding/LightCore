import { ButtonGrid } from "../components/StagePage/ButtonGrid";
import { StageToolbar } from "../components/StagePage/StageToolbar";

export type StagePageProps = {
    setActiveRoute: (route: string) => void;
}

export const StagePage = ({setActiveRoute}: StagePageProps) => {
    return (<>

        <ButtonGrid />
        <StageToolbar />
    </>)
}