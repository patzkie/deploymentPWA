import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import { OAuth2Client } from "google-auth-library";

 const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Login 
const loginUser = async(req,res)=>{
   
    const {email,password} = req.body;
    try {
        const user = await userModel.findOne({email});
        
        if(!user){
            return res.json({success:false, message:"User Doesn't exist"})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.json({success:false,message:"Invalid Credentials"})
        }

        const token = createToken(user._id);
        res.json({success:true,token})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

    const createToken = (id)=>{
        return jwt.sign({id},process.env.JWT_SECRET)
    }

//register user 
const registerUser = async(req,res)=>{

    const {name,password,email} = req.body;
    try {
        // checking is user already exist 
        const exist = await userModel.findOne({email});
        if (exist) {
            return res.json({success:false,message:"User Aldready Exist"})
        }
        //validating email formate & strong password
        if (!validator.isEmail(email)){
            return res.json({success:false,message:"Please Enter Valid email"})
        }

        if(password.length<8){
            return res.json({success:false, message:"Please enter Strong password"})
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }

}


// Google login controller
const googleLogin = async (req, res) => {
  const { email, name } = req.body;

  try {
    let user = await userModel.findOne({ email });

    if (!user) {
      // If user not found, register them with a random password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(email + process.env.JWT_SECRET, salt); // dummy password

      const newUser = new userModel({
        name,
        email,
        password: hashedPassword,
      });

      user = await newUser.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Google Login Error" });
  }
};







export { loginUser, registerUser, googleLogin, getUserProfile };