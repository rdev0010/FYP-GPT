import { title } from "process"
import "./global.css"

export const metadata = {
    title: "LimitlessGPT",
    description: "To explore and understand the real-world impact of youth-led climate and environmental initiatives."
}

const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

export default RootLayout