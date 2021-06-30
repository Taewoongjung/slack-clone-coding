import React, {useCallback, VFC} from 'react';
import Modal from "@components/Modal";
import {Button, Input, Label} from "@pages/style";
import useInput from "@hooks/useInput";
import axios from "axios";
import {useParams} from "react-router";
import {toast} from "react-toastify";
import useSWR from "swr";
import {IChannel, IUser} from "@typings/db";
import fetcher from "@utils/fetcher";

interface Props {
    show: boolean;
    onCloseModal: () => void;
    setShowCreateChannelModal: (flag: boolean) => void;
}
const CreateChannelModal: VFC<Props> = ({ show, onCloseModal, setShowCreateChannelModal }) => {
    const [newChannel, onChangeNewChannel, setNewChannel] = useInput('');
    const { workspace, channel} = useParams<{ workspace: string; channel: string}>();
    const {data: userData, error, revalidate} = useSWR<IUser | false>(
        'http://localhost:3095/api/users',
        fetcher,
        {
            dedupingInterval: 2000, // 2초
        });
    const { data: channelData, revalidate: revalidateChannel } = useSWR<IChannel[]>(
        userData ?`http://localhost:3095/api/workspaces/${workspace}/channels` : null,   // 내가 로그인 한 상태에만 채널 가져오게 하고 만약에 로그인 하지 않았으면 null로 가는 로직이다.
        fetcher
    ); // 채널 데이터 서버로부터 받아오기


    const onCreateChannel = useCallback((e) => {
        e.preventDefault();
        axios
            .post(`http://localhost:3095/api/workspaces/${workspace}/channels`, {
            name:newChannel,
        }, {
            withCredentials: true, // cookie 전달
        })
            .then(() => {
                setShowCreateChannelModal(false);
                revalidateChannel();
                setNewChannel('');
            })
            .catch((error) => {
                console.dir(error);
                toast.error(error.response?.data, { position: 'bottom-center' })
            });
    }, [newChannel]);

    return (
        <Modal show={show} onCloseModal={onCloseModal}>
            <form onSubmit={onCreateChannel}>
                <Label id="channel-label">
                    <span>채널</span>
                    <Input id="channel" value={newChannel} onChange={onChangeNewChannel} />
                </Label>
                <Button type="submit">생성하기</Button>
            </form>
        </Modal>
    )
};

export default CreateChannelModal;
