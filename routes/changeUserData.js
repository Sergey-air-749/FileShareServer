const express = require('express')  
const mongoose = require('mongoose')  
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer');
const sharp = require('sharp');
const fs = require('fs');
const router = express.Router()
require('dotenv').config();
const path = require('path');

const Users = require('../moduls/Users')

const authMidelwares = require('../midelwares/authMidelwares')
const multer = require('multer')


const { 
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
} = require('@aws-sdk/client-s3')


const s3Client = new S3Client({
    region: process.env.region,
    credentials: {
      accessKeyId: process.env.accessKeyId,
      secretAccessKey: process.env.secretAccessKey,
    }
})





let transporter = nodemailer.createTransport({
    // service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465, //587
    secure: true, //false
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


async function sendVerificationСhangeCode(recipientEmail, code) {
    let mailOptions = {
        from: '"Ваше приложение" <no-reply@yourdomain.com>',
        to: recipientEmail,
        subject: 'Подтверждение смены адреса электронной почты',
        text: `Ваш код подтверждения: ${code}. Он действует 10 минут.`,
        html: `<p>Ваш код подтверждения: <b>${code}</b>. Он действует 10 минут.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Код подтверждения отправлен на:', recipientEmail);
    } catch (error) {
        console.error('Ошибка при отправке почты:', error);
        throw new Error('Не удалось отправить код подтверждения');
    }
}


router.post('/change/avatar/default', authMidelwares, async (req, res) => {
    try {
        const userId = req.userId

        const pathOpen = path.join(__dirname, '../avatars/', userId + '.png')
        const pathSaveFull = path.join(__dirname, '../avatars/', userId + '1000.png')
        const pathSaveMini = path.join(__dirname, '../avatars/', userId + '400.png')

        const user = await Users.findOne({_id: userId})
        console.log(user);

        user.avatar = { 
            '400': "http://localhost:7000/api/images/avatars/default",
            '1000': "http://localhost:7000/api/images/avatars/default" 
        }
        await user.save()

        if(fs.existsSync(pathSaveFull)) {

            fs.unlink(pathSaveFull, err => {
                console.log('Файл успешно удалён');
            });

            fs.unlink(pathSaveMini, err => {
                console.log('Файл успешно удалён');
            });

            res.status(200).json({msg:'Аватарка сброшена'});

        } else {
            res.status(400).json({msg: 'Файл не наеден'});
        }
       
        
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});





const uploadAvatar = multer({
    storage: multer.memoryStorage(),
    limits: { 
        fileSize: 1024 * 1024 * 100000
    }
})


router.post('/change/avatar', uploadAvatar.single('avatar'), authMidelwares, async (req, res) => {
    try {
        
        const userId = req.userId
        req.file.originalname = userId + '.png'

        console.log(req.file);

        const img400 = await sharp(req.file.buffer)
            .resize({
                width: 1000,
                height: 1000,
                fit: sharp.fit.cover,
                position: sharp.gravity.center
            })
            .toFormat('png')
            .toBuffer();
            
        await s3Client.send(new PutObjectCommand({
            Bucket: 'sergay-air-bucket-one',
            Key: `avatars/${userId}1000.png`,
            Body: img400,
            ContentType: "image/png",
        }));



        const img1000 = await sharp(req.file.buffer)
            .resize({
                width: 400, 
                height: 400, 
                fit: sharp.fit.cover,
                position: sharp.gravity.center
            })
            .toFormat('png')
            .toBuffer();


        await s3Client.send(new PutObjectCommand({
            Bucket: 'sergay-air-bucket-one',
            Key: `avatars/${userId}400.png`,
            Body: img1000,
            ContentType: "image/png",
        }));



        const user = await Users.findOne({_id: userId})
        console.log(user);

        user.avatar = { 
            '400': "https://sergay-air-bucket-one.s3.eu-north-1.amazonaws.com/avatars/" + userId + '1000' + ".png",
            '1000': "https://sergay-air-bucket-one.s3.eu-north-1.amazonaws.com/avatars/" + userId + '400' + ".png",
        }
        await user.save()

        console.log('Файл успешно удалён');
        res.status(200).json({msg:'Новая аватарка сахранина'});
       
        
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});













router.put('/change/email', authMidelwares, async (req, res) => {
    console.log(req.body);
    console.log(req.headers);

    try {
        const userId = req.userId
        const code = Math.floor(Math.random() * 999999)
        const { emailNew } = req.body

        const user = await Users.findOne({_id: userId})
        console.log(user);
        const similarEmailuser = await Users.findOne({email: emailNew})

        if (!similarEmailuser) {
            const expirationTime = new Date();
            expirationTime.setTime(expirationTime.getTime() + (10 * 60 * 1000));

            user.verificationCode = code
            user.codeExpires = expirationTime
            user.emailNew = emailNew
            await user.save()

            sendVerificationСhangeCode(user.emailNew, code)

            res.status(200).json({msg:'Код отправлен'});   
        } else {
            res.status(400).json({msg: "Полизователь с такой почтой уже существует"})
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});






router.put('/change/username', authMidelwares, async (req, res) => {
    console.log(req.body);
    console.log(req.headers);
    try {
        const userId = req.userId
        const { usernameNew } = req.body

        const user = await Users.findOne({_id: userId})
        console.log(user);

        user.username = usernameNew
        await user.save()

        res.status(200).json({msg:'Имя пользователя изменина'});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});






router.put('/change/password', authMidelwares, async (req, res) => {
    console.log(req.body);
    console.log(req.headers);
    try {
        const userId = req.userId
        const { passwordOld, passwordNew, passwordRepeatNew } = req.body

        const user = await Users.findOne({_id: userId})
        console.log(user);

        const passwordValed = await bcrypt.compare(passwordOld, user.password)

        if (passwordValed != false) {

            if (passwordRepeatNew == passwordNew) {
                const hashed = await bcrypt.hash(passwordNew, 10)

                user.password = hashed  
                await user.save()
                res.status(200).json({msg:'Пароль изменён'});
            } else {
                res.status(400).json({msg: "Пароль не совподает"})
            }

        } else {
            res.status(400).json({msg: "Не верный пароль"})
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});


module.exports = router;