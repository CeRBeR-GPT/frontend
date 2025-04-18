
"use client"

import {createContext, useContext, useState, useEffect, useCallback, useRef} from "react"
import axios from "axios"
import { useAuth } from "@/hooks/use-auth"


type ProfileContextType = {

}

const ProfileContext = createContext<ProfileContextType>({

})

export function ProfileProvider({children}: { children: React.ReactNode }) {




    return (
        <ProfileContext.Provider
            value={{
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
}

export const profileAuth = () => useContext(ProfileContext)


