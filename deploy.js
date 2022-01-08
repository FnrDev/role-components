module.exports = [
    {
        name: "create",
        description: "Create a button",
        type: 1,
        options: [
            {
                name: "style",
                description: "Style of the button.",
                type: 3,
                choices: [
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
                ],
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
        ],
    },
    {
        name: "edit",
        description: "Edit an exits message button.",
        type: 1,
        options: [
            {
                name: "message_id",
                description: "The message id of message you want to edit.",
                type: 3,
                required: true
            },
            {
                name: "new_style",
                description: "Edit style of the button.",
                type: 3,
                choices: [
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
            },
            {
                name: "new_label",
                description: "Edit label of the button.",
                type: 3
            },
            {
                name: "new_role",
                description: "Edit role given of the button.",
                type: 8
            },
            {
                name: "new_content",
                description: "Edit content of the button.",
                type: 3
            },
            {
                name: "new_emoji",
                description: "Edit emoji of the button.",
                type: 3
            }
        ]
    },
    {
        name: "delete",
        description: "Delete button.",
        type: 1,
        options: [
            {
                name: "message_id",
                description: "The message id of the button.",
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "list",
        description: "List all buttons for this server.",
        type: 1,
        options: [
            {
                name: "filter_by_channel",
                description: "Filter buttons list by channel.",
                type: 7,
                channel_types: [0, 5]
            },
            {
                name: "filter_by_role",
                description: "Filter buttons list by role.",
                type: 8
            }
        ]
    }
]