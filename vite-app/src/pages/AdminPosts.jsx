import { useEffect, useState } from "react"
import { postService } from "../services/postService"

const AdminPosts = () => {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadPosts = async () => {
    const result = await postService.getAllPosts(page, 10)

    if (result.success) {
      setPosts(result.data.content)
      setTotalPages(result.data.totalPages)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [page])

  return (
    <div>
      <h2>All Posts (Admin)</h2>

      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            {post.title || post.fileName}
          </li>
        ))}
      </ul>

      <button
        disabled={page <= 1}
        onClick={() => setPage((p) => p - 1)}
      >
        Prev
      </button>

      <span>{page} / {totalPages}</span>

      <button
        disabled={page >= totalPages}
        onClick={() => setPage((p) => p + 1)}
      >
        Next
      </button>
    </div>
  )
}

export default AdminPosts
