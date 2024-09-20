import { useAdminTheme } from '../context/AdminThemeContext';

const Stepper = (props) => {
  const { step } = props;
  const { darkMode } = useAdminTheme();

  const getIsActiveBgColor = (current) => {
    if (step >= current) return getActiveBgColorDarkMode();
    else return 'bg-gray-500 text-gray-500' 
  }

  const getActiveBgColorDarkMode = () => {
    return darkMode ? 'bg-light-ACCENT text-light-TEXT' : 'bg-dark-ACCENT text-dark-TEXT';
  }

  return (
    <div className="max-w-2xl mx-auto py-10 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 text-center">
          <div
            className={`w-10 h-10 rounded-full text-white mx-auto flex items-center justify-center
              ${getIsActiveBgColor(1)}`
            }
          >
            1
          </div>
          <div className="text-xs font-medium mt-2">Upload</div>
        </div>
        <div className="relative flex-1 text-center">
          <div
            className={`w-10 h-10 rounded-full text-white mx-auto flex items-center justify-center
              ${getIsActiveBgColor(2)}`
            }
          >
            2
          </div>
          <div className="text-xs font-medium mt-2">Map fields</div>
        </div>
        <div className="relative flex-1 text-center">
          <div
            className={`w-10 h-10 rounded-full text-white mx-auto flex items-center justify-center
              ${getIsActiveBgColor(3)}`
            }
          >
            3
          </div>
          <div className="text-xs font-medium mt-2">Import</div>
        </div>
      </div>
    </div>
  )
}

export default Stepper;