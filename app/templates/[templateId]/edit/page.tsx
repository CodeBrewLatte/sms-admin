"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSmsTemplateById } from "@/lib/api";
import { SmsTemplate } from "@/types";

export default function TemplateEditPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;

  const [template, setTemplate] = useState<SmsTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [type, setType] = useState<"MARKETING" | "TRANSACTIONAL">("TRANSACTIONAL");
  const [defaultBody, setDefaultBody] = useState("");
  const [description, setDescription] = useState("");
  const [variables, setVariables] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [newVariable, setNewVariable] = useState("");

  useEffect(() => {
    async function loadTemplate() {
      const data = await getSmsTemplateById(templateId);
      if (data) {
        setTemplate(data);
        setName(data.name);
        setKey(data.key);
        setType(data.type);
        setDefaultBody(data.defaultBody);
        setDescription(data.description || "");
        setVariables([...data.variables]);
        setIsActive(data.isActive);
      }
      setLoading(false);
    }
    loadTemplate();
  }, [templateId]);

  const handleAddVariable = () => {
    if (newVariable.trim() && !variables.includes(newVariable.trim())) {
      setVariables([...variables, newVariable.trim()]);
      setNewVariable("");
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setVariables(variables.filter((v) => v !== variable));
  };

  const handleSave = () => {
    // Preview mode - show alert that changes won't persist
    alert("Preview Mode: Changes would be saved here, but no database is configured. This is just a preview of the edit interface.");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Template not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/templates"
          className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← Back to Master Templates
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Master Template</h1>
        <p className="text-sm text-gray-600 mt-1">Template Key: {template.key}</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Preview Mode:</strong> This is a preview of the template editor. Changes will not be saved since there is no database configured.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Home Equity Change Alert"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Key *
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., EQUITY_ALERT"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Template key cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Type and Status */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "MARKETING" | "TRANSACTIONAL")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TRANSACTIONAL">Transactional</option>
                <option value="MARKETING">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Template is active</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe what this template is used for..."
          />
        </div>

        {/* Variables */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variables
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {variables.map((variable) => (
              <span
                key={variable}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {`{{${variable}}}`}
                <button
                  onClick={() => handleRemoveVariable(variable)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                  type="button"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newVariable}
              onChange={(e) => setNewVariable(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddVariable();
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add variable name (without {{ }})"
            />
            <button
              onClick={handleAddVariable}
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Add
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Variables can be used in the template body as {`{{variable_name}}`}
          </p>
        </div>

        {/* Template Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Body *
          </label>
          <textarea
            value={defaultBody}
            onChange={(e) => setDefaultBody(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Enter the template message body..."
          />
          <p className="mt-2 text-xs text-gray-500">
            Use variables like {`{{variable_name}}`} to insert dynamic content
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
          <Link
            href="/templates"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

