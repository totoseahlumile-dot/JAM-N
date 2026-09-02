export const mockPosts = [
  {
    id: 'post_1',
    author: 'Nuriyah',
    avatar: '/images/avatars/nuriyah.jpg',
    timestamp: '2 hours ago',
    content: 'Just updated the streaming research links for Usimamane and Will Linley on the main directory! Check out their latest releases.',
    likes: 12,
    comments: 3,
    tags: ['DirectoryUpdate', 'HipHop', 'LocalMusic']
  },
  {
    id: 'post_2',
    author: 'Maiesha',
    avatar: '/images/avatars/maiesha.jpg',
    timestamp: '5 hours ago',
    content: 'Bongeziwe Mabandla live set added to the events calendar. Who is heading out to Cape Town for the show next week?',
    likes: 24,
    comments: 8,
    tags: ['Events', 'AfroFolk', 'CapeTownLive']
  }
]

export const postService = {
  getPosts() {
    return Promise.resolve(mockPosts)
  },
  createPost(newPost) {
    mockPosts.unshift({
      id: `post_${Date.now()}`,
      ...newPost,
      timestamp: 'Just now',
      likes: 0,
      comments: 0
    })
    return Promise.resolve(mockPosts[0])
  }
}