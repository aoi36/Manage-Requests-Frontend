import React, { useState, useEffect } from "react";
import { postService } from "../services/postService";
import { businessService } from "../services/businessService";
import { useAuth } from "../context/AuthContext";

const CreatePost = () => {
  const { user } = useAuth(); // Getting current logged-in user

  // Form State matching the new DTO
  const [formData, setFormData] = useState({
    contactInfo: "",
    email: "",
    phoneNumber: "",
    serviceId: "",
    subService: "",
    urgencyLevel: "LOW",
    title: "",
    description: ""
  });
  
  const [file, setFile] = useState(null);
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Services for the Dropdown when component loads
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await businessService.getAll(1, 100);
        // Ensure you adapt this based on your API response structure
        const servicesList = data.result?.content || data.result || [];
        setServices(servicesList);
      } catch (error) {
        console.error("Failed to load services", error);
      }
    };
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!file) {
      setMessage({ type: "error", text: "Vui lòng chọn file đính kèm (Please select a file)" });
      return;
    }
    if (!formData.serviceId) {
      setMessage({ type: "error", text: "Vui lòng chọn Dịch vụ (Please select a service)" });
      return;
    }

    setIsSubmitting(true);
    const result = await postService.createPost(formData, file);
    setIsSubmitting(false);

    if (result.success) {
      setMessage({ type: "success", text: "Tạo yêu cầu thành công (Post created successfully)" });
      setFile(null);
      setFormData({
        contactInfo: "", email: "", phoneNumber: "", serviceId: "",
        subService: "", urgencyLevel: "LOW", title: "", description: ""
      });
      // Reset file input UI manually
      document.getElementById('file-upload').value = ""; 
    } else {
      setMessage({ type: "error", text: result.error || "Có lỗi xảy ra" });
    }
  };

  return (
    <div className="upload-card">
      <div className="agri-form-wrapper">
        <p className="agri-warning">Các trường có dấu (*) bắt buộc phải điền.</p>
        
        <form onSubmit={handleSubmit}>
          
          <div className="agri-section-title">Thông tin liên hệ</div>
          <div className="agri-grid">
            {/* Left Column */}
            <div className="agri-col">
              <div className="agri-form-group">
                <label>Người gửi yêu cầu: <span className="req">*</span></label>
                <input 
                  type="text" 
                  className="agri-input" 
                  value={user?.username || ""} 
                  disabled 
                />
              </div>
              <div className="agri-form-group">
                <label>Thông tin liên hệ: <span className="req">*</span></label>
                <input 
                  type="text" 
                  name="contactInfo"
                  className="agri-input" 
                  value={formData.contactInfo} 
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="agri-form-group">
                <label>E-Mail:</label>
                <input 
                  type="email" 
                  name="email"
                  className="agri-input" 
                  value={formData.email} 
                  onChange={handleChange}
                />
              </div>
              <div className="agri-form-group">
                <label>Điện thoại: <span className="req">*</span></label>
                <input 
                  type="text" 
                  name="phoneNumber"
                  className="agri-input" 
                  value={formData.phoneNumber} 
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="agri-col">
              <div className="agri-form-group">
                <label>Dịch vụ: <span className="req">*</span></label>
                <select 
                  name="serviceId" 
                  className="agri-input" 
                  value={formData.serviceId} 
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {services.map(srv => (
                    <option key={srv.id} value={srv.id}>{srv.name}</option>
                  ))}
                </select>
              </div>
              <div className="agri-form-group">
                <label>Dịch vụ nhánh: <span className="req">*</span></label>
                <input 
                  type="text" 
                  name="subService"
                  className="agri-input" 
                  value={formData.subService} 
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="agri-form-group">
                <label>Mức độ khẩn cấp: <span className="req">*</span></label>
                <select 
                  name="urgencyLevel" 
                  className="agri-input" 
                  value={formData.urgencyLevel} 
                  onChange={handleChange}
                  required
                >
                  <option value="LOW">Thấp (Low)</option>
                  <option value="MEDIUM">Trung bình (Medium)</option>
                  <option value="HIGH">Cao (High)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Full Width Fields */}
          <div className="agri-block-group">
            <label>Tiêu đề: <span className="req">*</span></label>
            <input 
              type="text" 
              name="title"
              className="agri-block-input" 
              value={formData.title} 
              onChange={handleChange}
              required 
            />
          </div>

          <div className="agri-block-group">
            <label>Mô tả: <span className="req">*</span></label>
            <textarea 
              name="description"
              className="agri-block-input agri-textarea" 
              value={formData.description} 
              onChange={handleChange}
              required 
            ></textarea>
          </div>

          {/* File Upload Section */}
          <div className="agri-file-section">
            <div className="file-btn-wrapper">
              <button type="button" className="btn-add-file">Thêm File...</button>
              <input 
                id="file-upload"
                type="file" 
                onChange={(e) => setFile(e.target.files[0])} 
                required
              />
            </div>
            {file && <span style={{ marginLeft: "15px", fontWeight: "bold", color: "#b31f24" }}>{file.name}</span>}
          </div>

          {message.text && (
            <div className={message.type === "success" ? "success" : "error"}>
              {message.text}
            </div>
          )}

          <button type="submit" className="action-btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Tạo mới (Create)"}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default CreatePost;