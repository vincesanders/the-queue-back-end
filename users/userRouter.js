const router = require('express').Router();
const users = require('./userModel');
const errorHandler = require('../utils/errorHandler');
const validateUser = require('../utils/user-middleware/validateUser');
const validateUserId = require('../utils/user-middleware/validateUserId');
const validatePutAndFilter = require('../utils/user-middleware/validatePutAndFilter');
const validateUserAction = require('../utils/user-middleware/validateUserAction');
const getTicketData = require('../utils/ticket-middleware/getTicketData');
const checkRole = require('../utils/checkRole');

//gets a list of all users
router.get('/', (req, res) => {
    users.get().then(users => {
        res.status(200).json(users);
    }).catch(err => {
        errorHandler(res, err, 500, 'Unable to retrieve users.');
    });
});

router.get('/:id', validateUserId, (req, res) => {
    res.status(200).json(req.user);
});

//Allows for filtering with strings that are LIKE values
router.post('/getby/filter', validatePutAndFilter, (req, res) => {
    //must be { columname: columnvalue}
    users.getBy(req.body).then(users => {
        if (users.length > 0) {
            res.status(200).json(users);
        } else {
            res.status(500).json({ message: 'No users found.' });
        }
    }).catch(err => {
        errorHandler(res, err, 500, 'Unable to retrieve users.');
    });
});

router.get('/asker/:id/tickets', validateUserId, (req, res) => {
    users.getTicketsByAskerId(req.params.id).then(async tickets => {
        if (tickets.length > 0) {
            const ticketsToSend = await Promise.all(tickets.map(async ticket => getTicketData(ticket)));
            res.status(200).json(ticketsToSend);
        } else {
            res.status(204).json({ message: 'No tickets found.' });
        }
    }).catch(err => {
        errorHandler(res, err, 500, 'Unable to retrieve tickets.');
    });
});

router.get('/solvedby/:id/tickets', validateUserId, (req, res) => {
    users.getTicketsBySolvedById(req.params.id).then(async tickets => {
        if (tickets.length > 0) {
            const ticketsToSend = await Promise.all(tickets.map(async ticket => getTicketData(ticket)));
            res.status(200).json(ticketsToSend);
        } else {
            res.status(204).send();
        }
    }).catch(err => {
        errorHandler(res, err, 500, 'Unable to retrieve tickets.');
    });
});

router.get('/assignee/:id/tickets', validateUserId, (req, res) => {
    users.getTicketsByAssignee(req.params.id).then(async tickets => {
        if (tickets.length > 0) {
            const ticketsToSend = await Promise.all(tickets.map(async ticket => getTicketData(ticket)));
            res.status(200).json(ticketsToSend);
        } else {
            res.status(204).send();
        }
    }).catch(err => {
        errorHandler(res, err, 500, 'Unable to retrieve tickets.');
    });
});

//returns ALL tickets associated with the user, including
//tickets the user opened, solved, assigned or was assigned to.
router.get('/:id/alltickets', validateUserId, (req, res) => {
    users.getAllAssociatedTickets(req.params.id).then(async tickets => {
        if (tickets.length > 0) {
            const ticketsToSend = await Promise.all(tickets.map(async ticket => getTicketData(ticket)));
            res.status(200).json(ticketsToSend);
        } else {
            res.status(204).send();
        }
    }).catch(err => {
        errorHandler(res, err, 500, 'Unable to retrieve tickets.');
    });
});

//Same as above but only returns open tickets
router.get('/:id/allopentickets', validateUserId, (req, res) => {
    users.getAllAssociatedOpenTickets(req.params.id).then(async tickets => {
        if (tickets.length > 0) {
            const ticketsToSend = await Promise.all(tickets.map(async ticket => getTicketData(ticket)));
            res.status(200).json(ticketsToSend);
        } else {
            res.status(204).send();
        }
    }).catch(err => {
        errorHandler(res, err, 500, 'Unable to retrieve tickets.');
    });
});

//allows section leads to add a student
//students should be encouraged to change their password later
router.post('/', checkRole('section lead'), validateUser, (req, res) => {
    users.insert(req.body).then(user => {
        res.status(201).json(user);
    }).catch(err => {
        errorHandler(res, err, 500, 'Could not add user.');
    });
});

//change so only user themself, section leads or team leads can edit a user
router.put('/:id', validateUserId, validatePutAndFilter, validateUserAction, (req, res) => {
    users.update(req.body, req.params.id).then(user => {
        res.status(200).json(user);
    }).catch(err => {
        errorHandler(res, err, 500, 'Could not update user.');
    });
});

//can only be done by a team leads, section leads or the user themselves
router.delete('/:id', validateUserId, validateUserAction, (req, res) => {
    users.remove(req.params.id).then(numDeleted => {
        res.status(200).json(req.user);
    }).catch(err => {
        errorHandler(res, err, 500, "The user could not be removed");
    });
});

module.exports = router;