import React, {FC, useCallback} from 'react';
import Modal from "@components/Modal";
import axios from "axios";
import {useParams} from "react-router";
import useInput from "@hooks/useInput";
import useSWR from "swr";
import {IChannel, IUser} from "@typings/db";
import fetcher from "@utils/fetcher";
import {Button, Input, Label} from "@pages/style";
import {toast} from "react-toastify";

interface Props {
    show: boolean;
    onCloseModal: () => void;
    setShowInviteWorkspaceModal: (flag: boolean) => void;
}
const inviteWorkspaceModal: FC<Props> = ({ show, onCloseModal, setShowInviteWorkspaceModal }) => {
    const { workspace } = useParams<{ workspace: string; channel: string}>();
    const [ newMember, onChangeNewMemeber, setNewMember ] = useInput('');
    const { data: userData } = useSWR<IUser>('/api/users', fetcher);
    const { revalidate: revalidateChannel } = useSWR<IChannel[]>(
      userData ? `/api/workspaces/${workspace}/channels` : null,
        fetcher,
    );

    const onInviteMember = useCallback((e) => {
        e.preventDefault();
        if (!newMember || !newMember.trim()) {
            return;
        }
        axios
            .post(`/api/workspaces/${workspace}/members`, {
                email: newMember,
            })
            .then(() => {
                revalidateChannel();
                setShowInviteWorkspaceModal(false);
                setNewMember('');
            })
            .catch((error) => {
                console.dir(error);
                toast.error(error.response?.data, { position: 'bottom-center' });
            });
    }, [workspace]);

    return (
        <Modal show={show} onCloseModal={onCloseModal}>
            <form onSubmit={onInviteMember}>
                <Label id="member-label">
                    <span>이메일</span>
                    <Input id="member" type="email" value={newMember} onChange={onChangeNewMemeber} />
                </Label>
                <Button type={"submit"}>초대하기</Button>
            </form>
        </Modal>
    );
};

export default inviteWorkspaceModal;