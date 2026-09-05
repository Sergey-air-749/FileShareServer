const express = require('express')  
const router = express.Router()
require('dotenv').config();

const users = require('../moduls/Users')
const authMidelwares = require('../midelwares/authMidelwares')





async function getCheckUserNameById(userId) {

  const user = await users.findOne({ _id: userId });

  let userName = ''

  if (user != null) {

    if (user.isGuest != true && user.isDelete != true) {
      userName = user.username
    } else if (user.isDelete == true) {
      userName = 'Удалённый аккаунт'
    } else {
      userName = 'Гость'
    }

  } else {
    userName = 'Удалённый аккаунт'
  }

  return userName
}






// Story get CRUD

router.get('/story/get', authMidelwares, async (req, res) => {
    try {
         
        const userId = req.userId

        const user = await users.findOne({_id: userId})

        if (user != null) {
            
            let fileStoryDataRendering = user.filseStoryGet
    
            for (let i = 0; i < fileStoryDataRendering.length; i++) {
                let element = fileStoryDataRendering[i];
                
                const newSentToUserIdName = await getCheckUserNameById(element.sentToUserId)
                const newUserWillReceiveId = await getCheckUserNameById(element.userWillReceiveId)
    
                fileStoryDataRendering[i].sentToUser = newSentToUserIdName
                fileStoryDataRendering[i].userWillReceive = newUserWillReceiveId
            }
            
            res.status(200).send(fileStoryDataRendering);

        } else {
            res.status(404).send({ msg: "userNotFound" });
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
})


router.post('/story/get/delete/:id', authMidelwares, async (req, res) => {
    console.log(req.body);

    try {
        const { id } = req.params
        const userId = req.userId

        const user = await users.findOne({_id: userId})
        console.log(user);

        if (user != null) {

            const newFilseStory = user.filseStoryGet.filter((item) => item.id != id)
            user.filseStoryGet = newFilseStory
            await user.save()

            res.status(200).send({msg:'Удалено из истории'});
            
        } else {
            res.status(404).send({ msg: "userNotFound" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});


router.post('/story/get/deleteAll/', authMidelwares, async (req, res) => {
    console.log(req.body);
    try {
         
        const userId = req.userId

        const user = await users.findOne({_id: userId})
        console.log(user);

        if (user != null) {

            user.filseStoryGet = []
            await user.save()

            res.status(200).send({msg:'Вся история удалена'});
            
        } else {
            res.status(404).send({ msg: "userNotFound" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});










// Story send CRUD

router.get('/story/send', authMidelwares, async (req, res) => {
    try {
         
        const userId = req.userId
        const { timeZone, timeFormat } = req.query;

        const user = await users.findOne({_id: userId})

        if (user != null) {

            let fileStoryDataRendering = user.filseStorySend

            for (let i = 0; i < fileStoryDataRendering.length; i++) {
                let element = fileStoryDataRendering[i];
                
                const newSentToUserIdName = await getCheckUserNameById(element.sentToUserId)
                const newUserWillReceiveId = await getCheckUserNameById(element.userWillReceiveId)

                fileStoryDataRendering[i].sentToUser = newSentToUserIdName
                fileStoryDataRendering[i].userWillReceive = newUserWillReceiveId
            }
            
            res.status(200).send(fileStoryDataRendering);

        
        } else {
            res.status(404).send({ msg: "userNotFound" });
        }
            
        // console.log(user);

        // res.status(200).send(user.filseStorySend);
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
})

router.post('/story/send/delete/:id', authMidelwares, async (req, res) => {
    console.log(req.body);

    try {
         
        const { id } = req.params
        const userId = req.userId

        const user = await users.findOne({_id: userId})
        console.log(user);

        if (user != null) {

            const newFilseStory = user.filseStorySend.filter((item) => item.id != id)
            user.filseStorySend = newFilseStory
            await user.save()

            res.status(200).send({msg:'Удалено из истории'});

        } else {
            res.status(404).send({ msg: "userNotFound" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});

router.post('/story/send/deleteAll/', authMidelwares, async (req, res) => {
    console.log(req.body);
    try {
         
        const userId = req.userId

        const user = await users.findOne({_id: userId})
        console.log(user);

        if (user != null) {

            user.filseStorySend = []
            await user.save()

            res.status(200).send({msg:'Вся история удалена'});
                        
        } else {
            res.status(404).send({ msg: "userNotFound" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});




router.post('/files/send/delete/:id', authMidelwares, async (req, res) => {
    console.log(req.body);

    try {
         
        const { id } = req.params
        const { userWillReceiveId } = req.body
        const userId = req.userId

        console.log(req.params);
        console.log(req.body);

        const userWillReceive = await users.findOne({_id: userWillReceiveId})

        console.log(userWillReceive);
        console.log(userWillReceive.filse);

        if (userWillReceive == null) {
            res.status(404).send({msg:'userNotFound'});
        }
        
        const getFile = userWillReceive.filse.find((item) => item.id == id)

        if (getFile != undefined) {

            const newFilse = userWillReceive.filse.filter((item) => item.id != id)
            userWillReceive.filse = newFilse
            await userWillReceive.save()
    
    
            const user = await users.findOne({_id: userId})
            console.log(user);
    
            const newFilseStory = user.filseStorySend.filter((item) => item.id != id)
            user.filseStorySend = newFilseStory
            await user.save()
    
            res.status(200).send({msg:'Отправка отменина'});

        } else {
            res.status(400).send({msg:'failedToCancelSsending'});
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message})
    }
});





module.exports = router;