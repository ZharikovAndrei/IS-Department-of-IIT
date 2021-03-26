echo -e "--------------------------\n\n\n"
echo "started installing course projects component"
echo -e "\n\n\n--------------------------"
./install_course_projects_component.sh
echo -e "--------------------------\n\n\n"
echo "installed course projects component"
echo -e "\n\n\n--------------------------\n\n\n"
sleep 2
echo "started installing teacher component"
echo -e "\n\n\n--------------------------"
./install_teacher_component.sh
echo -e "--------------------------\n\n\n"
echo "installed teacher component"
echo -e "\n\n\n--------------------------"
sleep 2
echo "started installing role component"
echo -e "\n\n\n--------------------------"
./install_change_user_role_component.sh
echo -e "--------------------------\n\n\n"
echo "installed role component"
echo -e "\n\n\n--------------------------"
sleep 2
echo -e "--------------------------\n\n\n"
echo "started installing project tasks component"
echo -e "\n\n\n--------------------------"
./install_project_task_component.sh
echo -e "--------------------------\n\n\n"
echo "installed project tasks component"
echo -e "\n\n\n--------------------------\n\n\n"
sleep 2
./build_kb.sh 
../sc-machine/bin/sctp-server ../config/sc-web.ini
