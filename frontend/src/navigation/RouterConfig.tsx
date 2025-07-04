import { Routes, Route } from "react-router";

import { URLS } from "./CONSTANTS";

const RouterConfig = () => {
    return (
        <Routes>
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}
export default RouterConfig;