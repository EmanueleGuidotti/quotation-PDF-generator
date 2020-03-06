import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Button,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import ImagePicker from 'react-native-image-crop-picker';
import Spinner from 'react-native-loading-spinner-overlay';

// Image picker options
const IPoptions = {
  title: 'Choose company logo',
  storageOptions: {
    skipBackup: true,
    path: 'images',
    spinner: false,
  },
  width: 2000,
  height: 500,
  cropping: true,
  includeBase64: true,
  freeStyleCropEnabled: true,
};
const {width, height} = Dimensions.get('window');

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageLogo: null,
      textValue: null,
      titleValue: null,
    };
  }

  componentDidMount(): void {}

  _getImage = async () => {
    const image = await ImagePicker.openPicker(IPoptions);
    console.log(image);
    this.setState({imageLogo: image});
  };

  _onChangeText = (text, value) => {
    switch (value) {
      case 'title':
        this.setState({
          titleValue: text,
        });
        break;
      case 'textarea':
        this.setState({
          textValue: text,
        });
        break;
    }
  };

  _genDate = () => {
    let mm = new Date().getMonth() + 1;
    let dd = new Date().getDate();
    return [
      (dd > 9 ? '' : '0') + dd,
      (mm > 9 ? '' : '0') + mm,
      new Date().getFullYear(),
    ].join('/');
  };

  _createPdf = async () => {
    this.setState(
      {
        spinner: true,
      },
      async () => {
        const {
          imageLogo,
          imageLogo: {cropRect},
        } = this.state;
        let options = {
          html: `
          <img src="data:${this.state.imageLogo.mime};base64,${
            this.state.imageLogo.data
          }" style="width: 700px; height: auto; margin: 0 auto; display: inline-block;">
          <h1>Quotation for ${this.state.titleValue}</h1>
          <h4 style="font-size: 16px; text-align: right;">${this._genDate()}</h4>
          <p style="font-size: 20px; line-height: 16px;">${this.state.textValue.toString()}</p>
      `,
          fileName:
            'quotation_' +
            this.state.titleValue.split(' ').join('') +
            new Date().getTime(),
          width: 595,
          height: 822,
          directory: 'Documents',
        };
        let file = await RNHTMLtoPDF.convert(options);
        Alert.alert(
          'Done!',
          'Your quotation is ready! Open Documents to see your file.',
          [
            {
              text: 'Ok',
              onPress: () => {
                this.setState({
                  spinner: false,
                });
              },
            },
          ],
          {cancelable: false},
        );
      },
    );
  };

  _deleteAll = () => {
    Alert.alert(
      'Warning!',
      'Are you sure to delete all contents?',
      [
        {
          text: 'Cancel',
          onPress: () => {
            return false;
          },
          style: 'cancel',
        },
        {
          text: `Yes I'm sure`,
          onPress: () => {
            this.setState({
              imageLogo: null,
              textValue: null,
              titleValue: null,
            });
          },
        },
      ],
      {cancelable: false},
    );
  };

  render():
    | React.ReactElement<any>
    | string
    | number
    | {}
    | React.ReactNodeArray
    | React.ReactPortal
    | boolean
    | null
    | undefined {
    return (
      <>
        {this.state.spinner && (
          <Spinner
            visible={this.state.spinner}
            textContent={'Building document...'}
            textStyle={styles.spinnerTextStyle}
          />
        )}
        <View style={styles.viewContainer}>
          <View style={styles.row}>
            <Button title={'Choose company logo'} onPress={this._getImage} />
          </View>
          {this.state.imageLogo && (
            <View style={[styles.logoContainer, styles.row]}>
              <Image
                source={{
                  uri: `data:${this.state.imageLogo.mime};base64,${
                    this.state.imageLogo.data
                  }`,
                }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          )}
          <View style={styles.row}>
            <TextInput
              multiline={false}
              placeholder="Client name"
              style={styles.title}
              onChangeText={text => this._onChangeText(text, 'title')}
              value={this.state.titleValue}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              multiline={true}
              placeholder="Quotation content"
              style={styles.textArea}
              onChangeText={text => this._onChangeText(text, 'textarea')}
              value={this.state.textValue}
            />
          </View>
          <View style={styles.row}>
            <Button
              disabled={!this.state.imageLogo || !this.state.textValue}
              title={'Build quotation'}
              onPress={this._createPdf}
            />
          </View>
          <View style={styles.row}>
            <Button
              disabled={!this.state.imageLogo && !this.state.textValue}
              style={styles.deleteBtn}
              title={'Delete all'}
              onPress={this._deleteAll}
            />
          </View>
          {this.state.pdfPath && (
            <View style={styles.row}>
              <Image
                source={{uri: this.state.pdfPath}}
                style={{flex: 1}}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    flexDirection: 'column',
    width: width,
  },
  deleteBtn: {
    backgroundColor: '#ccc',
    color: 'black',
  },
  logo: {
    flex: 1,
    width: '100%',
    height: 'auto',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  row: {
    flex: 0,
    paddingHorizontal: 10,
    paddingTop: 10,
    margin: 0,
  },
  textArea: {
    height: 140,
    borderColor: 'gray',
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  title: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});
