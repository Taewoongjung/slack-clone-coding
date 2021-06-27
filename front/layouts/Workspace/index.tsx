import React, {FC, useCallback, useState} from 'react';
import useSWR from "swr";
import fetcher from "@utils/fetcher";
import axios from "axios";
import {Link, Redirect, Route} from "react-router-dom";
import {
    AddButton,
    Channels,
    Chats,
    Header, LogOutButton,
    MenuScroll,
    ProfileImg, ProfileModal,
    RightMenu, WorkspaceButton,
    WorkspaceName,
    Workspaces,
    WorkspaceWrapper
} from "@layouts/Workspace/style";
import gravatar from 'gravatar';
import {Switch} from "react-router";
import loadable from "@loadable/component";
import Menu from '@components/Menu';
import {IUser} from "@typings/db";
import {Button, Input, Label} from "@pages/style";
import useInput from "@hooks/useInput";
import Modal from "@components/Modal";
import { toast } from 'react-toastify';

const DirectMessage = loadable(() => import('@pages/DirectMessage'));
const Channel = loadable(() => import('@pages/Channel'));

const Workspace: FC = ({children}) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showCreateWorkSpaceModal, setShowCreateWorkSpaceModal] = useState(false);
    const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput('');
    const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');

    const {data: userData, error, revalidate} = useSWR<IUser | false>(
        'http://localhost:3095/api/users',
        fetcher,
        {
            dedupingInterval: 2000, // 2초
        });

    const onLogout = useCallback(() => {
        axios.post('http://localhost:3095/api/users/logout', null, {
            withCredentials: true,
        })
            .then(() => {
                revalidate();
            });
    }, []);

    if (userData === undefined) {
        return <div>로딩중...</div>
    }

    const onClickUserProfile = useCallback((e) => {
        e.stopPropagation();
        setShowUserMenu((prev) => !prev);
    }, []);

    const onClickCreateWorkspace = useCallback(() => {
        setShowCreateWorkSpaceModal(true);
    }, []);

    const onCreateWorkspace = useCallback((e) => {
        e.preventDefault();
        if(!newWorkspace || !newWorkspace.trim()) return;
        if(!newUrl || !newUrl.trim()) return;
        axios.post('/api/workspaces', {
            workspace: newWorkspace,
            url: newUrl,
        })
            .then(() => {
                revalidate();
                setShowCreateWorkSpaceModal(false);
                setNewWorkspace('');
                setNewUrl('');
            })
            .catch((error) => {
                console.dir(error);
                toast.error(error.response?.data, { position: 'bottom-center' });
            });
        },
        [newWorkspace, newUrl]
    );

    const onCloseModal = useCallback(() => {
        setShowCreateWorkSpaceModal(false);
    }, []);

    if (!userData) {
        return <Redirect to="/login" />
    }

    return (
        <div>
            <Header>
                <RightMenu>
                    <span onClick={onClickUserProfile}>
                        <ProfileImg src={gravatar.url(userData.email,{ s:'28px', d:'retro'})} alt={userData.nickname} />
                        {showUserMenu && (
                            <Menu style={{ right: 0, top: 38}} show={showUserMenu} onCloseModal={onClickUserProfile}>
                                <ProfileModal>
                                    <img src={gravatar.url(userData.email,{ s:'36px', d:'retro'})} alt={userData.nickname} />
                                    <div>
                                        <span id="profile-name">{userData.nickname}</span>
                                        <span id="profile-active">Active</span>
                                    </div>
                                </ProfileModal>
                                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
                            </Menu>
                        )}
                    </span>
                </RightMenu>
            </Header>
            <WorkspaceWrapper>
                <Workspaces>
                    {userData?.Workspaces.map((ws) => {
                      return (
                          <Link key={ws.id} to={`/workspace/${123}/channel/일반`}>
                              <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
                          </Link>
                      );
                    })}
                    <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
                </Workspaces>
                <Channels>
                    <WorkspaceName>Sleact</WorkspaceName>
                    <MenuScroll>menu scroll</MenuScroll>
                </Channels>
                <Chats>
                    <Switch>
                        <Route path="/workspace/dm" component={DirectMessage} />
                        <Route path="/workspace/channel" component={Channel} />
                    </Switch>
                </Chats>
            </WorkspaceWrapper>
            <Modal show={showCreateWorkSpaceModal} onCloseModal={onCloseModal}>
                <form onSubmit={onCreateWorkspace}>
                    <Label id="workspace-label">
                        <span>워크스페이스 이름</span>
                        <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace} />
                    </Label>
                    <Label id="workspace-url-label">
                        <span>워크스페이스 url</span>
                        <Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
                    </Label>
                    <Button type="submit">생성하기</Button>
                </form>
            </Modal>
        </div>
    );
};

export default Workspace;