const translationsSignUpCode = {
    ru: {
        subject: 'Подтверждение адреса электронной почты для завершения регистрации',
        text: (code) => `Ваш код подтверждения: ${code}. Он действует 10 минут.`,
        html: (code) => `<p>Ваш код подтверждения: <b>${code}</b>. Он действует 10 минут.</p>`,
        senderName: 'Обмен файлами'
    },
    en: {
        subject: 'Email verification to complete your registration',
        text: (code) => `Your verification code is: ${code}. It is valid for 10 minutes.`,
        html: (code) => `<p>Your verification code is: <b>${code}</b>. It is valid for 10 minutes.</p>`,
        senderName: 'File Sharing'
    }
};

const translationsСhangeCode = {
    ru: {
        subject: 'Подтверждение новый адреса электронной почты чтобы закончить изминение',
        text: (code) => `Ваш код подтверждения: ${code}. Он действует 10 минут.`,
        html: (code) => `<p>Ваш код подтверждения: <b>${code}</b>. Он действует 10 минут.</p>`,
        senderName: 'Обмен файлами'
    },
    en: {
        subject: 'Confirm your new email address to complete the change',
        text: (code) => `Your verification code is: ${code}. It is valid for 10 minutes.`,
        html: (code) => `<p>Your verification code is: <b>${code}</b>. It is valid for 10 minutes.</p>`,
        senderName: 'File Sharing'
    }
};

const translationsRecoveringAccountCode = {
    ru: {
        subject: 'Подтверждение адреса электронной почты для восстановления аккаунта',
        text: (code) => `Ваш код подтверждения: ${code}. Он действует 10 минут.`,
        html: (code) => `<p>Ваш код подтверждения: <b>${code}</b>. Он действует 10 минут.</p>`,
        senderName: 'Обмен файлами'
    },
    en: {
        subject: 'Email address verification for account recovery',
        text: (code) => `Your verification code is: ${code}. It is valid for 10 minutes.`,
        html: (code) => `<p>Your verification code is: <b>${code}</b>. It is valid for 10 minutes.</p>`,
        senderName: 'File Sharing'
    }
};

module.exports = {translationsRecoveringAccountCode, translationsSignUpCode, translationsСhangeCode};