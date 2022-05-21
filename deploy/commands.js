const buttonStyles = [
    {
        name: "Blue",
        value: "PRIMARY"
    },
    {
        name: "Gray",
        value: "SECONDARY"
    },
    {
        name: "Green",
        value: "SUCCESS"
    },
    {
        name: "Red",
        value: "DANGER"
    }
]

module.exports = [
    {
        name: "buttons",
        description: "Create buttons.",
        options: [
            {
                name: "create",
                description: "Create a message with buttons",
                type: 1,
                options: [
                    {
                        name: "type",
                        description: "Choose how role given works",
                        type: 3,
                        choices: [
                            {
                                name: "Toggle (This type adds/remove the role depending on whether the user has the role.)",
                                value: "toggle"
                            },
                            {
                                name: "Give (This type adds the role whenever a user click the button)",
                                value: "give"
                            },
                            {
                                name: "Take (This type removes the role whenever the user click the button)",
                                value: "take"
                            }
                        ],
                        required: true
                    },
                    {
                        name: "style",
                        description: "Style of the button.",
                        type: 3,
                        choices: buttonStyles,
                        required: true
                    },
                    {
                        name: "label",
                        description: "The label of button.",
                        type: 3,
                        required: true
                    },
                    {
                        name: "role",
                        description: "The role when user click the button",
                        type: 8,
                        required: true
                    },
                    {
                        name: "content",
                        description: "The content of message.",
                        type: 3,
                        required: true
                    },
                    {
                        name: "emoji",
                        description: "Emoji of button",
                        type: 3
                    },
                    {
                        name: "channel",
                        description: "Channel you want to send button to.",
                        type: 7,
                        channel_types: [0, 5]
                    }
                ]
            },

            // list command
            {
                name: "list",
                description: "Get list of all buttons",
                type: 1
            },

            // edit command
            {
                name: "edit",
                description: "Edit a button message",
                type: 1,
                options: [
                    {
                        name: "message_id",
                        description: "The message id to edit",
                        type: 3,
                        required: true
                    },
                    {
                        name: "label",
                        description: "The new label name",
                        type: 3
                    },
                    {
                        name: "style",
                        description: "The new button style",
                        type: 3,
                        choices: buttonStyles
                    },
                    {
                        name: "role",
                        description: "The new role to give",
                        type: 8
                    },
                    {
                        name: "content",
                        description: "The new message content",
                        type: 3
                    },
                    {
                        name: "emoji",
                        description: "The new button emoji",
                        type: 3
                    }
                ]
            },

            // delete command
            {
                name: "delete",
                description: "Delete a message",
                type: 1,
                options: [
                    {
                        name: "message_id",
                        description: "The message id to delete.",
                        type: 3,
                        required: true
                    }
                ]
            }
        ],
    },

    {
        name: "ping",
        description: "Get bot speed."
    }
]