import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@pages/style';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, useCallback } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface Props {
    show: boolean;
    onCloseModal: () => void;
    setShowInviteChannelModal: (flag: boolean) => void;
}
const InviteChannelModal: FC<Props> = ({ show, onCloseModal, setShowInviteChannelModal }) => {
    const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
    const [newMember, onChangeNewMember, setNewMember] = useInput('');
    const { data: userData } = useSWR<IUser>('/api/users', fetcher);
    const { revalidate: revalidateMembers } = useSWR<IUser[]>(
        userData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
        fetcher,
    );

    const onInviteMember = useCallback(
        (e) => {
            e.preventDefault();
            if (!newMember || !newMember.trim()) {
                return;
            }
            axios
                .post(`/api/workspaces/${workspace}/channels/${channel}/members`, {  // 멤버가 추가되면 추가된 멤버를 가져오기위해
                    email: newMember,
                })
                .then(() => {
                    revalidateMembers();  // 요청을 다시 보낸다
                    setShowInviteChannelModal(false);
                    setNewMember('');
                })
                .catch((error) => {
                    console.dir(error);
                    toast.error(error.response?.data, { position: 'bottom-center' });
                });
        },
        [newMember],
    );

    return (
        <Modal show={show} onCloseModal={onCloseModal}>
            <form onSubmit={onInviteMember}>
                <Label id="member-label">
                    <span>채널 멤버 초대</span>
                    <Input id="member" value={newMember} onChange={onChangeNewMember} />
                </Label>
                <Button type="submit">초대하기</Button>
            </form>
        </Modal>
    );
};

export default InviteChannelModal;
