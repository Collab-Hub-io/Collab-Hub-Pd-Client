using UnityEngine;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using System;
using System.Runtime.Serialization.Formatters.Binary;

public static class SaveLoad {
    
    public static void Save(PlayerData data)
    { 
        // Set up to write a file
        BinaryFormatter bf = new BinaryFormatter();
        FileStream file = File.Open(Application.persistentDataPath + "/saveData.txt", FileMode.OpenOrCreate);  // open or create is a must

        Debug.Log("Saving--------------------------------");
         Debug.Log("Username: " + data.username);
         //
         Debug.Log($"Color: {data.R}, {data.G}, {data.B}");
         //
         Debug.Log("Cardback: " + data.cardback);

         // save the data to the file
        bf.Serialize(file, data);
        file.Close();
        Debug.Log("File Saved..");
    }

    public static PlayerData Load()
    {
        if (File.Exists(Application.persistentDataPath + "/saveData.txt"))
        {
            BinaryFormatter bf = new BinaryFormatter();
            FileStream file = File.Open(Application.persistentDataPath + "/saveData.txt", FileMode.Open);
            PlayerData data = (PlayerData)bf.Deserialize(file);
            
            file.Close();

            return data;
        } else
        {
            PlayerData data = new PlayerData();
            return data;
        }
    }

    public static PlayerData Restart()
    {
        Debug.Log("restarting playerdata");
        return new PlayerData();
    }
}
