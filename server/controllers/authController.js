import mongoose from "mongoose";
import User from "../models/User.js";
export const Register = async (req, res) =>{
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({success:false, message:"All fields are required!!"});
        }

        const existingUser = await User.findOne({email});

        if(existingUser) return res.status(409).json({success: false, message: "Email is already Exists with this email."});

        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        })

        return res.status(201).json({success: true, message: "User Registered successfully", 
            data:{
                id:user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email:user.email,
                role:user.role
            }});

    } catch (error) {
        console.log("error", error.message);
        return res.status(500).json({success: false, message: error.message});
    }
}

