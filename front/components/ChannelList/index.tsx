// import useSocket from '@hooks/useSocket';
import { CollapseButton } from '@components/DMList/style';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import useSWR from 'swr';

const ChannelList: FC = () => {
    const { workspace } = useParams<{ workspace?: string }>();
    // const [socket] = useSocket(workspace);
    const { data: userData, error, revalidate, mutate } = useSWR<IUser>('/api/users', fetcher, {
        dedupingInterval: 2000, // 2초
    });
    const { data: channelData } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher);
    const [channelCollapse, setChannelCollapse] = useState(false);
    const [countList, setCountList] = useState(false);

    const toggleChannelCollapse = useCallback(() => {
        setChannelCollapse((prev) => !prev);
    }, []);

    const resetCount = useCallback(
        (id) => () => {
            setCountList((list) => {
                return {
                    ...list,
                    [id]: undefined,
                };
            });
        }, []
    );

    useEffect(() => {
        console.log('ChannelList: workspace 바꼈다', workspace, location.pathname);
        setCountList({});
    }, [workspace, location]);

    return (
        <>
            <h2>
                <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
                    <i
                        className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
                        data-qa="channel-section-collapse"
                        aria-hidden="true"
                    />
                </CollapseButton>
                <span>Channels</span>
            </h2>
            <div>
                {!channelCollapse &&
                channelData?.map((channel) => {
                    return (
                        <NavLink
                            key={channel.name}
                            activeClassName="selected"
                            to={`/workspace/${workspace}/channel/${channel.name}`}
                            onClick={resetCount(`c-${channel.id}`)}
                        >
                            <span># {channel.name}</span>
                        </NavLink>
                    );
                })}
            </div>
        </>
    );
};

export default ChannelList;
