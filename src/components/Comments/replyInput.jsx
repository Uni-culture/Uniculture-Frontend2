import {TextField} from "@mui/material";
import React, {useState} from "react";
import "./replyInput.scss";
import { RxCornerBottomLeft } from "react-icons/rx";
import axios from "axios";

const ReplyInput = ({ parent_id, board_id, onReplySuccess}) => {
    const [replyContent, setReplyContent] = useState('');

    const getToken = () => {
        return localStorage.getItem('accessToken'); // 로컬 스토리지에서 토큰 가져옴
    };
    const token = getToken();

    const replyComment = async () => { // 대댓글 등록
        console.log('replyComment start');
        try {
            const response = await axios.post(`/api/auth/comment?postId=${board_id}`,
                {
                    postId: board_id,
                    parentId: parent_id,
                    content: replyContent
                }, {
                    headers: {
                        Authorization: `Bearer ${token}` // 헤더에 토큰 추가
                    }
                });
            if (response.status === 200) {
                const responseData = response.data;
                console.log(`responseData : `, responseData);
                setReplyContent(""); // 댓글 입력창 초기화
                onReplySuccess();
            }
        } catch (error) { // 실패 시
            if(error.response.status === 401) {
                console.log("401 오류");
            }
            else {
                console.log("서버 오류 입니다.");
                alert(error.response.data);
            }
        }
    };

    return (
        <div className="replyComments-wrapper">
            <div className="header-with-icon">
                <div className="reply-style">
                    <RxCornerBottomLeft />
                </div>
                <div className="replyComments-header">
                    <TextField
                        className="replyComments-header-textarea"
                        maxRows={3}
                        onChange={(e) => {
                            setReplyContent(e.target.value)
                        }}
                        value={replyContent}
                        multiline placeholder="답글을 입력해주세요"
                    />
                    {replyContent !== "" ? (
                        <button onClick={replyComment} className="replyComment-submit-Button">등록하기</button>
                    ) : (
                        <button disabled={true} className="replyComment-submit-Button">
                            등록하기
                        </button>
                    )}
                </div>
            </div>
            <hr className="hr-style"/>
        </div>
    );
};

export default ReplyInput;