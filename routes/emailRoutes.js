const express = require('express')  
const router = express.Router()
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer')

const Users = require('../moduls/users')

const authMidelwares = require('../midelwares/authMidelwares')
const cron = require("node-cron");


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


async function sendVerificationSingUpCode(recipientEmail, code) {
    let mailOptions = {
        from: '"Ваше приложение" <no-reply@yourdomain.com>',
        to: recipientEmail,
        subject: 'Подтверждение адреса электронной почты',
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

async function sendVerificationСhangeCode(recipientEmail, code) {
    let mailOptions = {
        from: '"Ваше приложение" <no-reply@yourdomain.com>',
        to: recipientEmail,
        subject: 'Подтверждение адреса электронной почты',
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



router.post('/:option/email/verify', authMidelwares, async (req, res) => {
    try {
        const { code } = req.body
        const userId = req.userId
        const { option } = req.params
      
        const user = await Users.findOne({_id: userId})
        console.log(user);

        const expirationTime = new Date(user.codeExpires)

        if (expirationTime > new Date()) {

            if (user.verificationCode != code) {
                res.status(400).json({ msg: 'Неверный код подтверждения.' });
            } else {

                user.verificationCode = undefined
                user.codeExpires = undefined

                if (option == 'change') {

                    if (user.emailNew != null) {

                        user.email = user.emailNew
                        user.emailNew = undefined

                        await user.save()
                        res.status(200).json({msg: 'Адрес эл. почты изменён'});

                    } else {
                        res.status(200).json({msg: 'Что-то пошло не так'});
                    }



                } else if (option == 'signup') {

                    user.isVerified = undefined

                    await user.save()

                    res.status(200).json({msg: 'Пользователь зарегистрирован'});

                } else {
                    res.status(400).json({msg:'Ошибка при вирефикацы, повторите попытку'});
                }
            }

        } else {

            user.verificationCode = undefined
            user.codeExpires = undefined

            await user.save()

            res.status(400).json({ msg: 'Срок действия кода истёк. Запросите новый код.' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
})


router.get('/:option/email/new', authMidelwares, async (req, res) => {
    console.log(req.headers);

    try {
        const userId = req.userId
        const { option } = req.params
        const code = Math.floor(Math.random() * 999999)

        const user = await Users.findOne({_id: userId})
        console.log(user);

        const expirationTime = new Date();
        expirationTime.setTime(expirationTime.getTime() + (10 * 60 * 1000));

        user.verificationCode = code
        user.codeExpires = expirationTime

        await user.save()

        if (option == 'change') {

            sendVerificationСhangeCode(user.emailNew, code)

        } else if (option == 'signup') {

            sendVerificationSingUpCode(user.email, code)

        } else {
            res.status(400).json({msg:'Ошибка при отправке, повторите попытку'});
        }

        res.status(200).json({msg:'Новый код отправлен'});

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});

router.get('/:option/email/cancel', authMidelwares, async (req, res) => {
    console.log(req.headers);

    try {
        const userId = req.userId
        const { option } = req.params

        // if (!option || option == '') {
            
        // }
        const user = await Users.findOne({_id: userId})
        console.log(user);

        user.verificationCode = undefined
        user.codeExpires = undefined

        if (option == 'change') {

            user.emailNew = undefined
            await user.save()

        } else if (option == 'signup') {

            const userDel = await Users.findByIdAndDelete({_id: userId})

        } else {
            res.status(400).json({msg:'Ошибка при отмене, повторите попытку'});
        }

        res.status(200).json({msg:'Верификацыя отменина'});

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});

cron.schedule("0 0 * * * *", async () => {
    try {

        const users = await Users.find()
        
        users.forEach(async (user, index) => { 
            
            const expirationTime = new Date(user.codeExpires)

            if (expirationTime < new Date()) {

                user.emailNew = undefined
                user.verificationCode = undefined
                user.codeExpires = undefined

                await user.save()

                console.log("Код потвирждения удалён:", user.username);
            }

        });

    } catch (error) {
        console.log(error);   
    }
});


async function init() {
    try {

        const users = await Users.find()
        
        users.forEach(async (user, index) => { 
            
            const expirationTime = new Date(user.codeExpires)

            if (expirationTime < new Date()) {

                user.emailNew = undefined
                user.verificationCode = undefined
                user.codeExpires = undefined

                await user.save()

                console.log("Код потвирждения удалён:", user.username);
            }

        });

    } catch (error) {
        console.log(error);   
    }
}

init()




module.exports = router;