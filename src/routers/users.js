const express = require('express');
const sharp = require('sharp');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

const {
    sendWellcomeEmail,
    sendCancelationEmail
} = require('../emails/account');

const router = new express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save()
        // sendWellcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/users/me', authMiddleware, async (req, res) => {
    // User.find({})
    //     .then(result => res.send(result))
    //     .catch(error => res.status(500).send(error));
    // try {
    //     const users = await User.find({});
    //     res.send(users);
    // } catch (error) {
    //     res.status(500).send(error);
    // }
    res.send(req.user);
})

router.get(`/users/:id`, authMiddleware, async (req, res) => {
    const { id } = req.params;
    // User.findById(id)
    //     .then(result => {
    //         if (!result) {
    //             return res.status(404).send();
    //         }
    //         res.send(result)
    //     })
    //     .catch(error => res.status(500).send(error));

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error)
    }
})

// router.patch('/users/:id', async (req, res) => {
//     const updates = Object.keys(req.body);
//     const allowedUpdates = ['name', 'email', 'password', 'age'];
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }
//     const { id } = req.params;
//     try {
//         const user = await User.findById(id);
//         updates.forEach(update => {
//             user[update] = req.body[update]
//         })
//         console.log(user);
//         await user.save();
//         // const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })

//         if (!user) {
//             res.status(400).send();
//         }

//         res.send(user);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// })

router.patch('/users/me', authMiddleware, async (req, res) => {
    try {
        const { user, body } = req;
        const updates = Object.keys(body);
        const allowedUpdates = ['name', 'email', 'password', 'age'];
        const isValidOperation = updates.every(item => allowedUpdates.includes(item));

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }

        updates.forEach(filed => user[filed] = body[filed]);
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.delete('/users/me', authMiddleware, async (req, res) => {
    // const { id } = req.params;
    const { user } = req;
    try {
        // const user = await User.findByIdAndDelete(id);
        // if (!user) {
        //     res.status(404).send({ error: `User with ${id} was not found` })
        // }
        // We decided to user mangoose API
        await user.remove();
        // sendCancelationEmail(user.email, user.name);
        res.send(user);
    } catch (error) {
        res.status(500).send({ error: `User with ${id} was not found` })
    }
})

router.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        // to hide private data we can:
        // 1 create method in model getPublicProfile that will delete private data
        // 2 create method toJSON that will do the same, but we should not call it below
        res.send({
            // user: user.getPublicProfile(),
            user,
            token
        })
    } catch (error) {
        console.log(error);
        res.status(403).send(error.message);
    }
})

router.post('/users/logout', authMiddleware, async (req, res) => {
    try {
        const { user, token } = req;
        user.tokens = user.tokens.filter(item => item.token !== token);
        await user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

router.post('/users/logoutAll', authMiddleware, async (req, res) => {
    try {
        const { user } = req;
        user.tokens = [];
        await user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

// Set multer to store file in the desination 'avatar'
const avatar = multer({
    // dest: 'avatar',
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        const { originalname } = file;
        if (!originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Please upload an image'))
        }

        cb(undefined, true);
    }
})

// Set key of file in the post data
router.post('/users/me/avatar', authMiddleware, avatar.single('avatar'), async (req, res) => {
    const { user, file } = req;
    //Modify size and concert to png
    const buffer = await sharp(file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    user.avatar = buffer;
    await user.save();
    res.send(user);
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', authMiddleware, async (req, res) => {
    const { user } = req;
    try {
        user.avatar = null;
        await user.save();
        res.send();
    } catch (error) {
        res.status(500).send({ error: 'Problem with API delete image' })
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user || !user.avatar) {
            throw new Error('Could not fetch nessecary data');
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send({ error: 'File does not exist' })
    }
})

module.exports = router;