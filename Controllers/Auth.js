import Users from "../Models/Users.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import sendMail from "../services/Mail.js";



// send OTP to email and save the user data in cookies temporary until OTP verification is done

export const sendOtp = async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) return res.status(400).json({ message: "All fields are required" });
    try {
        // check email already registered ot not
        const existingUser = await Users.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        // check the password strength (you can implement your own logic or use a library like zxcvbn)
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        // Hash the password before saving (you can use bcrypt or any other hashing library)
        const hashedPassword = await bcrypt.hash(password, 10);
        // create a unique token using jwt
        const uniqueToken = jwt.sign({ foo: 'bar' }, 'shhhhh');

        // Check the email using otp
        const generateOtp = Math.floor(100000 + Math.random() * 900000).toString();

        const mailer = await sendMail(email, "OTP for Email Verification", `Your OTP is: ${generateOtp}`, `<p>Your OTP is: <b>${generateOtp}</b></p>`);
        // Here you would typically send the OTP to the user's email address using a service like SendGrid, Nodemailer, etc.

        // save all login credentials  in database but validation is false

        if (!mailer) {
            return res.status(500).json({ message: "Error sending OTP" });
        }

        try {
            const createUser = await Users.create({ fullName, email, password: hashedPassword, uniqueToken, otp: generateOtp, validation: "false", createdAt: new Date(), updatedAt: new Date() });

            if (createUser) {

                return res.status(200).json({
                    message: "OTP sent to email successfully",
                    user: createUser
                });
            }
        }
        catch (error) {
            return res.status(500).json({ message: "Error sending OTP", error: error });
        }

    }
    catch (error) {
        return res.status(500).json({ message: "Error sending OTP", error: error });
    }
}
// User Registration Controller
export const Register = async (req, res) => {
    const { email, otp } = req.body;

    // Here you would typically add logic to save the user to the database
    // For now, we'll just return a success message with the provided data

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });
    try {

        const savedOtp = await Users.findOne({ where: { email }, attributes: ['otp'] });

        if (!savedOtp || savedOtp.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (savedOtp.otp == otp) {
            // If OTP is valid, create the user in the database 
            const createUser = await Users.update({ validation: "true", otp: "" }, { where: { email } });


            if (createUser) {

                const getUser = await Users.findOne({ where: { email }, attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'email'] } });


                return res
                    .cookie("token", getUser.uniqueToken, {
                        httpOnly: true,
                        secure: false, // true in production
                        sameSite: "lax",
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                    })
                    .status(200)
                    .json({
                        message: "User registered successfully",
                        user: getUser,
                    });



            }
        }
        else {
            return res.status(400).json({ message: "Failed to register user" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error registering user", error: error });
    }
}


// User Login Controller
export const Login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    try {

        const user = await Users.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Generate a new unique token for the session
        var uniqueToken = user.uniqueToken;
        // Update the user's unique token in the database   
        await Users.update({ uniqueToken }, { where: { id: user.id } });
        // Save the token in a cookie to maintain the session
        res.cookie("token", uniqueToken, {
            httpOnly: true,   // 🔥 prevents JS access (secure
            secure: false,    // true in production (HTTPS
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(200).json({
            message: "Login successful",
            user: user
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error logging in", error: error });
    }
}

// Check if user is authenticated or not
export const CheckAuth = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized", isLogin: false });
    }
    try {
        const user = await Users.findOne({ where: { uniqueToken: token }, attributes: { exclude: ['password', 'createdAt', 'updatedAt'] } });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        res.status(200).json({
            message: "Authenticated",
            isLogin: true,
            user: user
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error checking authentication", error: error });
    }
}


export const otpVerification = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });
    try {
        const tempUser = req.cookies.tempUser;
        if (!tempUser || tempUser.email !== email) {
            return res.status(400).json({ message: "Invalid request" });
        }
        if (tempUser.generateOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        // If OTP is valid, create the user in the database
        const createUser = await Users.create({
            fullName: tempUser.fullName,
            email: tempUser.email,
            password: tempUser.password,
            uniqueToken: tempUser.uniqueToken,

            createdAt: new Date(),
            updatedAt: new Date()
        });
        if (createUser) {
            // Save the session token in a cookie to keep the user logged in
            res.cookie("token", tempUser.uniqueToken, {
                httpOnly: true,   // 🔥 prevents JS access (secure  
                secure: false,    // true in production (HTTPS
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            // Clear the temporary user cookie
            res.clearCookie("tempUser");
            res.status(201).json({
                message: "User registered and authenticated successfully",
                user: createUser
            });
        } else {
            res.status(400).json({ message: "Failed to register user" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error: error });
    }
}

// Logout Controller (optional, you can implement this if you want to allow users to log out by clearing the cookie)
export const Logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
}