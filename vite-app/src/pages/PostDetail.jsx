import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { postService } from "../services/postService"

const PostDetail = () => {
  const { id } = useParams()
  const [post, setPost] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      const result = await postService.getPostDetail(id)
      if (result.success) {
        setPost(result.data)
      }
    }

    fetchPost()
  }, [id])

  if (!post) return <p>Loading...</p>

  return (
    <div>
      <h2>{post.title}</h2>
      <p>Uploaded by: {post.username}</p>
      <p>File: {post.fileName}</p>
      <p>Viewed: {post.viewed ? "Yes" : "No"}</p>
    </div>
  )
}

export default PostDetail
