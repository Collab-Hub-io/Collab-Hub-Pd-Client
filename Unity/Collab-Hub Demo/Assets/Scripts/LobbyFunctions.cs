using System.Collections;
using System.Collections.Generic;
using UnityEngine;
//using UnityEngine.UI;
using TMPro;

public class LobbyFunctions : MonoBehaviour
{
    public static LobbyFunctions inst;

    public bool inRoom = false;

    public TMP_InputField roomInput;
    public GameObject joinBox;
    public Animator errorAnim;
    public GameObject lobbyButtons;
    public GameObject usernameInput;

    public TextMeshProUGUI roomNameText;
    public GameObject backButton;

    public GameObject playButton;

    private void Awake()
    {
        inst = this;
        // not the first time here
        if (GameManager.instance) loadMainUserList();
    }

    public void createGameBtn()
    {
        nh_network.server.createNewLobby();
        lobbyButtons.SetActive(false);
        usernameInput.SetActive(false);
        backButton.SetActive(true);
    }

    public void joinGameBtn()
    {
        lobbyButtons.SetActive(false);
        usernameInput.SetActive(false);
        joinBox.SetActive(true);
        backButton.SetActive(true);
    }

    public void joinLobbyInput()
    {
        if (roomInput.text != "")
        {
            string firstLetter = roomInput.text[0].ToString();
            string code = roomInput.text.ToLower();
            code = firstLetter.ToUpper() + code.Substring(1);
            Debug.Log("Room code received: " + code);

            nh_network.server.joinRoom(code);
        }
    }

    public void clearInput(TMP_InputField field)
    {
        field.text = "";
    }

    public void goBack()
    {
        if (inRoom)    // leaving lobby
        {
            nh_network.server.leaveRoom();
            GetComponent<UsernameActions>().removeAllUsernames();
            roomNameText.text = "- Main Lobby -";
            // load main lobby usernames
            inRoom = false;
            playButton.SetActive(false);
            loadMainUserList();
        }

        lobbyButtons.SetActive(true);
        //usernameInput.SetActive(true);
        backButton.SetActive(false);
        joinBox.SetActive(false);
    }

    public void enterRoom(string roomname)
    {
        if (joinBox.activeInHierarchy) joinBox.SetActive(false);
        roomNameText.text = "Room Code: " + roomname;
        GetComponent<UsernameActions>().removeAllUsernames();
        playButton.SetActive(true);
        inRoom = true;
    }

    public void playBtnInteraction(bool enable)
    {
        playButton.GetComponent<UnityEngine.UI.Button>().interactable = enable;
    }

    public void playGame()
    {

        nh_network.server.startGame();
    }

    public void openUsernamePanel(bool open)
    {
        usernameInput.SetActive(open);
    }

    public void showRoomError(string error)
    {
        errorAnim.GetComponent<TextMeshProUGUI>().text = error;
        errorAnim.SetTrigger("flash");
    }

    public void loadMainUserList()
    {
        GetComponent<UsernameActions>().removeAllUsernames();
        nh_network.server.getAllUsernames();
    }
}
