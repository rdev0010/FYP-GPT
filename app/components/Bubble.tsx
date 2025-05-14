// const Bubble = ({message}) => {
//     const { content, role } = message
//     return (
//         <div className={`${role} bubble`}>
//             {content}
//         </div>
//     )
// }

import { Message } from '@ai-sdk/react'
const Bubble = ({ message, children }: { message: Message, children: React.ReactNode }) => {
    return (
        <div className={`bubble ${message.role}`}>
            {children}
        </div>
    )
}

export default Bubble