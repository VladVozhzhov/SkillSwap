import React from 'react'
import { FaGithub, FaEnvelope, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#001f3f] text-white py-8">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-2">SkillSwap</h3>
          <p className="text-sm text-gray-300">
            A community-driven platform where people trade knowledge, learn together, and grow their skills—one swap at a time.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#about" className="hover:underline">About</a></li>
            <li><a href="#about" className="hover:underline">About</a></li>
            <li><a href="#" className="hover:underline">Explore Skills</a></li>
            <li><a href="#" className="hover:underline">Post a Skill</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Connect</h4>
          <div className="flex space-x-4 items-center">
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
              <FaGithub className="w-6 h-6 hover:text-purple-400" />
            </a>
            <a href="mailto:team@skillswap.com">
              <FaEnvelope className="w-6 h-6 hover:text-purple-400" />
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="w-6 h-6 hover:text-purple-400" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} SkillSwap. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
