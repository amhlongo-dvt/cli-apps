import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text } from 'ink';
export default function App({ name = 'Stranger' }) {
    return (_jsxs(Text, { children: ["Hello, ", _jsx(Text, { color: "green", children: name })] }));
}
//# sourceMappingURL=app.js.map