import {Container, Header} from "@pages/Channel/style";
import React, {useCallback} from 'react';
import ChatBox from "@components/ChatBox";
import useInput from "@hooks/useInput";
import ChatList from "@components/ChatList";

const Channel = () => {
    const [chat, onChangeChat, setChat] = useInput('');
    const onSubmitForm = useCallback((e) => {
        e.preventDefault();
        console.log('submit');
        setChat('');
    }, []);

    return <Container>
        <Header>channel</Header>
        <ChatList />
        <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
};

export default Channel;