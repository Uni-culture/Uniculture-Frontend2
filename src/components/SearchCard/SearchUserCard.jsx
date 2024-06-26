import React, { useState } from 'react'
import styles from './SearchUserCard.module.css';
import { GiMale, GiFemale } from "react-icons/gi";
import { useNavigate } from 'react-router-dom';
import {useTranslation} from "react-i18next";
import Swal from 'sweetalert2';
import axios from "axios";
import api from "../../pages/api";

export default function SearchUserCard({user, type}) {
    const [friendStatus, setFriendStatus] = useState(user.friendstatus); // 친구사이에 따라 버튼 변경
    const navigate = useNavigate();
    const { t } = useTranslation();

    //친구 프로필로 이동
    const handleProfile = () => {
        navigate(`/profile/${user.nickname}`);
    }

    const errorModal = (error) => {
        if(error.response.status === 401) {
            Swal.fire({
                icon: "warning",
                title: `<div style='font-size: 21px; margin-bottom: 10px;'>${t('loginWarning.title')}</div>`,
                confirmButtonColor: "#8BC765",
                confirmButtonText: t('loginWarning.confirmButton'),
            }).then(() => {
                navigate("/sign-in");
            })
        }
        else {
            Swal.fire({
                icon: "warning",
                title: `<div style='font-size: 21px; margin-bottom: 10px;'>${t('serverError.title')}</div>`,
                confirmButtonColor: "#8BC765",
                confirmButtonText: t('serverError.confirmButton'),
            })
        }
    };

    const friendButton = () => {
        switch (friendStatus){
            case 1 :
                return (
                    <button
                        className={styles.btn}
                        onClick={deleteFriend}
                    >{t('profile.removeFriend')}</button>
                );

            case 2 :
                return (
                    <button
                        className={styles.btn}
                        onClick={sendFriendRequest}
                    >{t('profile.addFriend')}</button>
                );

            case 3 :
                return (
                    <button
                        className={styles.btn}
                        onClick={cancelRequest}
                    >{t('profile.cancelRequest')}</button>
                );
            case 4 :
                return (
                    <button
                        className={styles.btn}
                        onClick={acceptReceivedRequest}
                    >{t('profile.acceptFriend')}</button>
                );
            default:
                return ;
        }
    };

    const getToken = () => {
        return localStorage.getItem('accessToken'); // 쿠키 또는 로컬 스토리지에서 토큰을 가져옴
    };

    //친구 신청
    const sendFriendRequest = async () => {
        try {
            const token = getToken(); // 토큰 가져오기

            const response = await api.post('/api/auth/friend-requests', {
                targetId: user.id
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // 헤더에 토큰 추가
                }
            });
            if(response.status === 200){
                alert(t("profile.friendRequestSuccess"));
                setFriendStatus(3); //친구 신청 중으로 변경

            }
        } catch (error) {
            errorModal(error);
        }
    }

    // 친구 삭제
    const deleteFriend = () => {
        Swal.fire({
            title: t('friendDelete.title'),
            text: t('friendDelete.text'),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: t('friendDelete.deleteButton'),
            cancelButtonText: t('friendDelete.cancelButton')
        }).then(async (result) => { // async 키워드를 사용하여 비동기 함수로 변환
            if (result.isConfirmed) {
                try {
                    const token = getToken();

                    const response = await api.delete('/api/auth/friend', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        data: {
                            targetId: user.id
                        }
                    });
                    
                    if(response.status === 200){
                        console.log("친구 삭제 : " + user.nickname);
                        setFriendStatus(2);
                    }
                } catch (error) {
                    errorModal(error);
                }      
            }
        });
    };


    // 보낸 친구 신청 취소
    const  cancelRequest = async () => {
        try {
            const token = getToken();

            const response = await api.delete('/api/auth/friend-requests', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    targetId: user.id
                }
            });
            
            if(response.status === 200){
                console.log(user.nickname + "님에게 보낸 친구 신청을 취소합니다.");
                setFriendStatus(2); 
            }
        } catch (error) {
            errorModal(error);
        }
    };

    // 친구 신청 받기
    const  acceptReceivedRequest = async () => {
        try {
            const token = getToken();

            const response = await api.put(`/api/auth/friend-requests/${user.id}`, {
                status: 'accepted'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if(response.status === 200){
                console.log(user.nickname + "님의 친구 요청을 수락했습니다.");
                setFriendStatus(1); //친구 상태로 변경
            }
        } catch (error) {
            errorModal(error);
        }
    };

    return (
        <div className={styles.cardWrapper}>
            <div className={styles.imageWrapper} onClick={handleProfile}>
                <div className={styles.profileImageWrapper}>
                    <img
                        src={user?.profileurl ? user.profileurl : "/default_profile_image.png"}
                        alt="profile"
                        className={styles.image}
                    />
                </div>

                <div className={styles.countryImageWrapper}>
                    <img className={styles.country} alt='country' src={`/${user.country}.png`} />
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.profileText}>
                    <div className={styles.userInfo}>
                        <div className={styles.nicknameText} onClick={handleProfile} >{user?.nickname}</div>
                        <div className={styles.genderText}>
                            {user?.gender === "MAN" ? (
                                    <GiMale color='blue' size={20} />
                            ):(
                                <GiFemale color='red' size={20}/>
                            )}
                        </div>
                        <div className={styles.ageText}>{user?.age}</div>
                    </div>    
                    <div >
                        {type !== 'friend' && friendButton()}
                    </div>
                </div>

                <div className={styles.introduce}>{user?.introduce ? user.introduce : <span className={styles.introtext}>{t('userProfile.userIntroduction')}</span>}</div>
            </div>
        </div>
    )
}
