import { useState } from "react"
import { signInWithGitHub, signOutWithGitHub } from "../helpers/p0tion"

/**
 * Component for GitHub login
 */
export const Login = () => {

    const [user, setUser] = useState<string>(localStorage.getItem("username")?.toString() || "")

    const login = async () => {
        const user = await signInWithGitHub()
        setUser(user)
    }
    
    return (
        <>
            <button onClick={user ? () => signOutWithGitHub(setUser) : login}>
                {user ? "Logout" : "Login"}
            </button>
        </>
    )
}
