import {SignIn} from "@clerk/clerk-react"

const Signin = () => {
  return (
    <div className='fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black bg-opacity-25 z-10'>
       <div>
        <div></div>
       <SignIn/>
       </div>
    </div>
  )
}

export default Signin
