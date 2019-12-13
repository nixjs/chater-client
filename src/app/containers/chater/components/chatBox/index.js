/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Button, Image, TextArea } from 'grommet';
import { AddCircle, Camera, Apps, Attachment, Add } from 'grommet-icons';
import { useSubscription, useMutation, useQuery } from '@apollo/react-hooks';
import * as lodash from 'lodash';
import * as moment from 'moment';
import { MESSAGE_ADD_SUB, CREATE_MESSAGE, GET_MESSAGES } from 'app/containers/chater/graphql';
import { MOMENT } from 'app/consts';
import { createMessageAction } from '../../service';

const ChatBox = ({ currentUser }) => {
    const textInput = useRef();
    const messageListRef = useRef();
    const [messages, setMessages] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [muationCreateMessage] = useMutation(CREATE_MESSAGE);
    const messageRespone = useQuery(GET_MESSAGES);

    useSubscription(MESSAGE_ADD_SUB, {
        onSubscriptionData: ({ _client, subscriptionData }) => {
            if (!lodash.isEmpty(subscriptionData) && !lodash.isEmpty(subscriptionData.data)) {
                const {
                    data: { messageAdded },
                } = subscriptionData;
                setMessages(prevMessage => [...prevMessage, messageAdded]);
                scrollToBottom();
            }
        },
    });

    useEffect(() => {
        if (!lodash.isEmpty(messageRespone) && !lodash.isEmpty(messageRespone.data)) {
            const { loading, data } = messageRespone;
            setLoading(loading);
            setMessages(data.messages);
        }
    }, [messageRespone, setMessages]);

    const scrollToBottom = () => {
        const scrollHeight = messageListRef.current.scrollHeight;
        const height = messageListRef.current.clientHeight;
        const maxScrollTop = scrollHeight - height;
        messageListRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    };

    const onSubmit = useCallback(() => {
        const data = {
            user_id: {
                _id: currentUser._id,
            },
            room_id: {
                _id: '5deb471c64d66e7f78856798',
            },
            message_body: textInput.current.value,
            message_status: true,
            created_by: {
                _id: currentUser._id,
            },
        };
        return createMessageAction(data, muationCreateMessage).then(res => {
            textInput.current.value = '';
        });
    }, []);

    const isMyMessage = (username, _id) => {
        return (currentUser && lodash.isEqual(username, currentUser.username)) || lodash.isEqual(_id, currentUser._id);
    };

    const renderTimeMessage = (createdAt, updatedAt) =>
        updatedAt ? moment(createdAt).format(MOMENT.HOUR_MINUTES) : moment(updatedAt).format(MOMENT.HOUR_MINUTES);

    const renderMessage = () => {
        if (isLoading) return <>🐶 Fetching...</>;
        return (
            messages &&
            messages.map(item => {
                const { username, _id } = item.sender;
                const isMyMess = isMyMessage(username, _id);
                const time = renderTimeMessage(item.createdAt, item.updatedAt);
                return (
                    <Box
                        key={item._id}
                        align="center"
                        justify={isMyMess ? 'end' : 'start'}
                        margin={{ bottom: 'large' }}
                        fill="horizontal"
                        flex="shrink"
                        direction="row-responsive"
                        pad={{ [isMyMess ? 'right' : 'left']: 'medium' }}>
                        <Box align="center" justify="center">
                            <Box
                                align="center"
                                justify="center"
                                background={{ color: isMyMess ? 'brand' : 'dark-4', dark: true, opacity: 'medium' }}
                                pad={{ left: 'medium', right: 'xsmall', top: 'xsmall', bottom: 'xsmall' }}
                                round={{ corner: isMyMess ? 'right' : 'left' }}>
                                <Text size="small">{item.message_body}</Text>
                            </Box>
                            <Box align="center" justify="end" direction="row-responsive" alignSelf="stretch">
                                <Text size="xsmall">{time}</Text>
                            </Box>
                        </Box>
                    </Box>
                );
            })
        );
    };
    return (
        <Box
            align="center"
            justify="start"
            fill="horizontal"
            alignSelf="stretch"
            background={{ dark: true, color: 'dark-1' }}
            overflow="hidden"
            flex="shrink">
            <Box
                align="center"
                justify="between"
                direction="row-responsive"
                alignSelf="stretch"
                border={{ color: 'dark-2', side: 'bottom' }}
                fill="horizontal"
                flex="grow">
                <Box align="center" justify="center" flex="shrink">
                    <Box
                        align="center"
                        justify="start"
                        direction="row-responsive"
                        alignSelf="stretch"
                        pad={{ top: 'small', bottom: 'small', left: 'small', right: 'small' }}
                        fill="horizontal"
                        flex="shrink"
                        background={{ opacity: 'medium' }}
                        hoverIndicator={true}>
                        <Box align="center" justify="center" height="xxsmall" width="xxsmall" overflow="hidden" flex="grow" round="full">
                            <Image src="https://photos.smugmug.com/Pinnacles-May-2019/n-8KLNDR/i-bxkrqwL/0/1c7fa7f2/M/i-bxkrqwL-M.jpg" />
                        </Box>
                        <Box
                            align="stretch"
                            justify="start"
                            fill="horizontal"
                            alignSelf="stretch"
                            pad={{ left: 'small', right: 'small' }}
                            direction="column">
                            <Text weight="bold" size="small">
                                {currentUser.username}
                            </Text>
                            <Text size="xsmall">Online</Text>
                        </Box>
                    </Box>
                </Box>
                <Box align="center" justify="center">
                    <Box
                        align="center"
                        justify="between"
                        direction="row-responsive"
                        alignSelf="stretch"
                        pad={{ left: 'small', right: 'small', vertical: 'small', top: 'small' }}>
                        <Button icon={<AddCircle />} />
                        <Button icon={<Camera />} />
                        <Button icon={<Apps />} />
                    </Box>
                </Box>
            </Box>
            <Box
                align="center"
                justify="center"
                fill="vertical"
                alignSelf="stretch"
                background={{
                    image: "url('http://xpanthersolutions.com/admin-templates/gappa/html/dark/assets/images/authentication-bg.jpg')",
                }}
                direction="row-responsive"
                overflow="hidden">
                <Box
                    align="stretch"
                    justify="start"
                    direction="row-responsive"
                    pad="small"
                    overflow="auto"
                    alignSelf="stretch"
                    wrap={true}
                    ref={messageListRef}>
                    {renderMessage()}
                </Box>
            </Box>
            <Box align="center" justify="start" alignSelf="stretch" border={{ color: 'dark-2', side: 'top' }}>
                <Box
                    align="center"
                    justify="center"
                    direction="row-responsive"
                    fill="horizontal"
                    flex="grow"
                    alignSelf="stretch"
                    border={{ color: 'dark-2', side: 'left' }}>
                    <TextArea plain={true} size="small" placeholder="Type a message..." ref={textInput} />
                    <Button icon={<Attachment />} />
                    <Button icon={<Add />} onClick={onSubmit} />
                </Box>
            </Box>
        </Box>
    );
};

ChatBox.propTypes = {
    currentUser: PropTypes.object,
};

export default memo(ChatBox);
