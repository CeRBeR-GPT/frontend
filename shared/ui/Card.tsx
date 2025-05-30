import { CardContent, CardDescription, CardHeader, CardTitle, Card } from "@/shared/ui/UI/card"
import { ReactNode } from "react"

export const card = (
    {   title, 
        description, 
        children 
    } :   
    { 
        title: string, 
        description : string, 
        children: ReactNode
    }) => {
    return(
        <Card>
            <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}