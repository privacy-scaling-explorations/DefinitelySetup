import { useContext } from "react"
import { signInWithGitHub, signOutWithGitHub } from "../helpers/p0tion"
import { StateContext } from "../context/StateContext";

/**
 * Component for GitHub login
 */
export const Login = () => {

    const { user, setUser } = useContext(StateContext);

    const login = async () => {
        const user = await signInWithGitHub()
        if (setUser) setUser(user)
    }
    
    const handleSignOut = async () => {
        await signOutWithGitHub()
        if (setUser) setUser(undefined)
    }
    
    return (
        <>
            <button onClick={user ? handleSignOut : login}>
                {user ? "Logout" : "Login"}
            </button>
        </>
    )
}
