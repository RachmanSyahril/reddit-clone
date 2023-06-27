import React, { useEffect } from 'react';
import PageContent from '@/src/components/Layout/PageContent';
import PostItem from '@/src/components/Posts/PostItem';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@/src/firebase/clientApp';
import usePosts from '@/src/hooks/usePosts';
import { useRouter } from 'next/router';
import { doc, getDoc } from '@firebase/firestore';
import { Post } from '@/src/atoms/postsAtom';
import useCommunityData from '@/src/hooks/useCommunityData';
import About from '@/src/components/Community/About';

const PostPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const {
    postStateValue,
    setPostStateValue,
    onDeletePost,
    onVote
  } = usePosts();
  const router = useRouter();
  const { communityStateValue } = useCommunityData();

  const fetchPost = async (postId: String) => {
    try {
      const postDocRef = doc(firestore, 'posts', postId);
      const postDoc = await getDoc(postDocRef);
      setPostStateValue(prev => ({
        ...prev,
        selectedPost: { id: postDoc.id, ...postDoc.data() } as Post
      }));
    } catch (error) {
      console.log('fetchPost error', error);
    }
  };

  useEffect(() => {
    const { pid } = router.query;

    if (pid && !postStateValue.selectedPost) {
      fetchPost(pid as String);
    }
  }, [router.query, postStateValue.selectedPost]);

  return (
    <PageContent>
      <>
        {postStateValue.selectedPost && (
          <PostItem
            post={postStateValue.selectedPost}
            onVote={onVote}
            onDeletePost={onDeletePost}
            userVoteValue={
              postStateValue.postVotes.find(
                item => item.postId === postStateValue.selectedPost?.id
              )?.voteValue
            }
            userIsCreator={user?.uid === postStateValue.selectedPost?.creatorId}
          />
        )}
        {/* Comments */}
      </>
      <>
        {communityStateValue.currentCommunity && (
          <About communityData={communityStateValue.currentCommunity} />
        )}
      </>
    </PageContent>
  );
};

export default PostPage;
