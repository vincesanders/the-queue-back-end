const router = require('express').Router();
const comments = require('./commentModel');
const errorHandler = require('../utils/errorHandler');
const validateCommentId = require('../utils/comment-middleware/validateCommentId');
const validateCommentPutAndFilter = require('../utils/comment-middleware/validateCommentPutAndFilter');
const validateCommentAction = require('../utils/comment-middleware/validateCommentAction');

router.put('/:id', validateCommentId, validateCommentPutAndFilter, validateCommentAction, (req, res) => {
    comments.update(req.body, req.params.id).then(comment => {
        //not needed for PostgreSQL
        // comment.is_solution === 0 ? comment.is_solution = false : comment.is_solution = true;
        res.status(200).json(comment);
    }).catch(err => {
        errorHandler(res, err, 500, 'Could not update comment.');
    });
});

//can only be done by a team leads, section leads or the user who posted the comment themselves
router.delete('/:id', validateCommentId, validateCommentAction, (req, res) => {
    comments.remove(req.params.id).then(comment => {
        //not needed for PostgreSQL
        // comment.is_solution === 0 ? comment.is_solution = false : comment.is_solution = true;
        res.status(200).json(comment);
    }).catch(err => {
        errorHandler(res, err, 500, "The comment could not be removed");
    });
});

module.exports = router;