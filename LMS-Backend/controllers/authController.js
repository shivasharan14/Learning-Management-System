const User = require('../models/User')

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

async function registerUser(req,res){
     
    try {
        const { name, email, password, contactNumber } = req.body;
        const userexist = await User.findOne({email:email})

        if(userexist){
            return res.status(400).send({msg:"user aleready exist",success:false})
        }
        const salt =await bcrypt.genSalt(10)
        const hashpassword= await bcrypt.hash(password,salt)

        const user = await User.create({
            name:name,
            email:email,
            password:hashpassword,
            contactNumber:contactNumber

        })

        const token = jwt.sign(
            {id:user.id,role:user.role},
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
         );

         const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            contactNumber: user.contactNumber,
         };

         res.status(201).send({ user: userResponse, token: token, success: true });
    } catch (error) {
        res.status(500).send({msg:"server error"})
        
    }

}

async function loginUser(req,res){
    try {
        const {email,password}=req.body
        const user = await User.findOne({email:email})
       if (!user) {
  return res.status(400).send({ msg: "User not found. Please register first.", success: false });
}
        const matchpassword =await bcrypt.compare(password,user.password)
        if(!matchpassword){
           return res.status(400).send({msg:"Invalid user credential",success:false})  
        }

        if (!user.isActive) {
      return res.status(403).send({ msg: "Your account is blocked. Contact admin.", success: false });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
    };

    res.status(200).send({ user: userResponse, token: token, success: true });


    } catch (error) {
        res.status(500).send({msg:"server error ",success:false})
    }

}

async function getMe(req, res) {
  try {
    res.status(200).send({ user: req.user, success: true });
  } catch (error) {
    res.status(500).send({ msg: "server error", success: false });
  }
}

module.exports={registerUser,loginUser,getMe}