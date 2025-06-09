import { textExtensions, textMimeTypes } from "@/shared/const";
import { useToast } from "@/shared/hooks";
import { RefObject, useCallback, useState } from "react";


export const useMessageOptions = ( onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
    textareaRef: RefObject<HTMLTextAreaElement | null>, fileInputRef: RefObject<HTMLInputElement | null> ,
    recognitionRef:  RefObject<any>) => {
    const [isRecording, setIsRecording] = useState(false)
    const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "processing">("idle")
    const { toast } = useToast()
    
    const isTextFile = (file: File): boolean => {
        if (textMimeTypes.includes(file.type)) return true
        const fileName = file.name.toLowerCase()
        return textExtensions.some((ext) => fileName.endsWith(ext))
    }
    
    const handleFileUpload = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }, [])


    const handleFileChange = useCallback( (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    
        if (!isTextFile(file)) {
            toast({
                title: "Неподдерживаемый формат",
                description: "Пожалуйста, загрузите текстовый файл (.txt, .md, .js, .json и т.д.)",
                variant: "destructive",
            })
            return
        }
    
        if (file.size > 1024 * 1024) {
            toast({
                title: "Файл слишком большой",
                description: "Максимальный размер файла - 1MB",
                variant: "destructive",
            })
            return
        }
    
        const reader = new FileReader()

        reader.onload = (event) => {
            try {
            const content = event.target?.result as string
            const sample = content.slice(0, 1000)
            const nonPrintableCount = sample.split("").filter((char) => {
                const code = char.charCodeAt(0)
                return code < 32 || code === 127
            }).length

            if (nonPrintableCount > sample.length * 0.1) {
                toast({
                    title: "Бинарный файл",
                    description: "Файл содержит бинарные данные и не может быть обработан",
                    variant: "destructive",
                })
                return
            }

            if (textareaRef.current) {
                const currentValue = textareaRef.current.value
                const newValue = currentValue ? `${currentValue}\n\n${content}` : content
                const syntheticEvent = {
                target: { value: newValue },
                } as React.ChangeEvent<HTMLTextAreaElement>
                onChange(syntheticEvent)
                toast({
                    title: "Файл загружен",
                    description: `Содержимое файла "${file.name}" добавлено в поле ввода`,
                })
            }
            } catch (error) {
            toast({
                title: "Ошибка чтения файла",
                description: "Не удалось прочитать содержимое файла",
                variant: "destructive",
            })
            }
        }
    
        reader.onerror = () => {
            toast({
                title: "Ошибка чтения файла",
                description: "Не удалось прочитать содержимое файла",
                variant: "destructive",
            })
        }

        reader.readAsText(file)
    },[onChange])

    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current
        if (!textarea) return
        textarea.style.height = "auto"
        const newHeight = Math.max(60, Math.min(textarea.scrollHeight, 200))
        textarea.style.height = `${newHeight}px`

    }, [])

    const startRecording = useCallback(() => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            toast({
                title: "Не поддерживается",
                description: "Ваш браузер не поддерживает распознавание речи",
                variant: "destructive",
            })
            return
        }
    
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
    
            const recognition = recognitionRef.current
            recognition.lang = "ru-RU"
            recognition.interimResults = false
            recognition.maxAlternatives = 1
    
            recognition.onstart = () => {
                setIsRecording(true)
                setRecordingStatus("recording")
            }
    
            recognition.onresult = (event: any) => {
                setRecordingStatus("processing")
                const transcript = event.results[0][0].transcript
                if (textareaRef.current) {
                    const currentValue = textareaRef.current.value
                    const newValue = currentValue ? `${currentValue} ${transcript}` : transcript
                    const syntheticEvent = {
                        target: { value: newValue },
                    } as React.ChangeEvent<HTMLTextAreaElement>

                    onChange(syntheticEvent)
                }
            }
    
            recognition.onerror = (event: any) => {
                setIsRecording(false)
                setRecordingStatus("idle")

                toast({
                    title: "Ошибка распознавания",
                    description: `Ошибка: ${event.error}`,
                    variant: "destructive",
                })
            }
    
            recognition.onend = () => {
                setIsRecording(false)
                setRecordingStatus("idle")
            }
    
            recognition.start()
          } catch (error) {
                setIsRecording(false)
                setRecordingStatus("idle")
        
                toast({
                    title: "Ошибка",
                    description: "Не удалось запустить распознавание речи",
                    variant: "destructive",
                })
        }
    }, [onChange])
    
    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
    }, [])

    return { isTextFile, handleFileUpload, adjustTextareaHeight, handleFileChange, stopRecording, startRecording,
        isRecording, recordingStatus};
};
