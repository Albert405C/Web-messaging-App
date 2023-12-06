exports.createMessage = async (req, res) => {
	    try {
		            const message = await Message.createMessage(req.body);
		            res.status(201).json(message);
		        } catch (error) {
				        console.error(error);
				        res.status(500).send('Failed to create message');
				    }
};

exports.getAllMessages = async (req, res) => {
	    try {
		            const messages = await Message.getAllMessages();
		            res.status(200).json(messages);
		        } catch (error) {
				        console.error(error);
				        res.status(500).send('Failed to get messages');
				    }
};

exports.getMessageById = async (req, res) => {
	    try {
		            const message = await Message.getMessageById(req.params.id);
		            if (!message) {
				                return res.status(404).send('Message not found');
				            }
		            res.status(200).json(message);
		        } catch (error) {
				        console.error(error);
				        res.status(500).send('Failed to get message');
				    }
};

exports.updateMessageById = async (req, res) => {
	    try {
		            const message = await Message.updateMessageById(req.params.id, req.body);
		            if (!message) {
				                return res.status(404).send('Message not found');
				            }
		            res.status(200).json(message);
		        } catch (error) {
				        console.error(error);
				        res.status(500).send('Failed to update message');
				    }
};

exports.deleteMessageById = async (req, res) => {
	    try {
		            await Message.deleteMessageById(req.params.id);
		            res.status(204).send();
		        } catch (error) {
				        console.error(error);
				        res.status(500).send('Failed to delete message');
				    }
};01~
