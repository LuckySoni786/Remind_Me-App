import User from "../models/User.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
export const registerUser = asyncHandler(async (req, res) =>{

        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
             throw new ApiError(400, "All fields are required!!");
        }

        const existingUser = await User.findOne({email});

        if(existingUser)  throw new ApiError(409, "Email is already Exists with this email.");

        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        })
const token = user.generateAccessToken();

console.log(token);
return res.status(201).cookie("accessToken", token, options).json( new ApiResponse(201, "User Registered successfully", {
            user:{
                id:user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email:user.email,
                role:user.role
            }}));

 
});

const options = {
    httpOnly: true,
    secure: false
};

export const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and Password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = user.generateAccessToken();

    return res
    .status(200)
    .cookie("accessToken", token, options)
    .json(
        new ApiResponse(
            200,
            "Login Successful",
            {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                },
            }
        )
    );

});

export const getCurrentUser = asyncHandler(async(req, res)=>{
    return res.status(200).json(
        new ApiResponse(
            200,
            "Current User fetched successfully!",
            req.user
        )
    );
});

export const logout = asyncHandler(async(req, res)=>{
    
        
    return res.status(200).clearCookie("accessToken", options).json(
        new ApiResponse(
            200,
            "Current User Loged out!"
        )
    );
});