import axios from 'axios';

const API_URL = 'https://acciojob-backend-7xqz.onrender.com/api/components';

const createComponent = async (componentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL, componentData, config);
  return response.data;
};

const updateComponent = async (id, updateData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}/${id}`, updateData, config);
  return response.data;
};

const getComponents = async (token, page = 1, limit = 10, search = '', type = '') => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
      type
    }
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

const getComponent = async (id, token, codeOnly = false) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      codeOnly
    }
  };
  const response = await axios.get(`${API_URL}/${id}`, config);
  return response.data;
};

const getVersions = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  };
  const response = await axios.get(`${API_URL}/${id}/versions`, config);
  return response.data;
};

const deleteComponent = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

const exportComponent = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob'
  };
  const response = await axios.get(`${API_URL}/${id}/export`, config);
  return response;
};

const restoreVersion = async (componentId, versionId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  };
  const response = await axios.post(`${API_URL}/${componentId}/restore/${versionId}`, {}, config);
  return response.data;
};

export default {
  createComponent,
  updateComponent,
  getComponents,
  getComponent,
  getVersions,
  deleteComponent,
  exportComponent,
  restoreVersion
};